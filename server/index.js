import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import db from './db.js';
import crypto from 'node:crypto';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const generateId = () => crypto.randomUUID();

// API Endpoints

// Get invitations for an address
app.get('/api/invitations/:address', (req, res) => {
  const { address } = req.params;
  const received = db.prepare("SELECT * FROM invitations WHERE invitee = ? AND status = 'pending'").all(address);
  const sent = db.prepare("SELECT * FROM invitations WHERE inviter = ? AND status = 'pending'").all(address);
  res.json({ received, sent });
});

// Send invitation
app.post('/api/invitations', (req, res) => {
  const { inviter, invitee, timeControl, color, rated } = req.body;
  if (inviter === invitee) return res.status(400).json({ error: 'Cannot invite yourself' });

  const id = generateId();
  db.prepare('INSERT INTO invitations (id, inviter, invitee, timeControl, createdAt) VALUES (?, ?, ?, ?, ?)')
    .run(id, inviter, invitee, JSON.stringify({ ...timeControl, color, rated }), Date.now());

  res.json({ id, inviter, invitee, timeControl, color, rated, status: 'pending' });
});

// Respond to invitation
app.post('/api/invitations/respond', (req, res) => {
  const { id, status } = req.body; // status: 'accepted' or 'declined'

  const invite = db.prepare('SELECT * FROM invitations WHERE id = ?').get(id);
  if (!invite) return res.status(404).json({ error: 'Invitation not found' });

  db.prepare('UPDATE invitations SET status = ? WHERE id = ?').run(status, id);

  if (status === 'accepted') {
    const gameId = generateId();
    const settings = JSON.parse(invite.timeControl);

    // Determine colors
    let white, black;
    if (settings.color === 'white') {
      white = invite.inviter;
      black = invite.invitee;
    } else if (settings.color === 'black') {
      white = invite.invitee;
      black = invite.inviter;
    } else {
      const isInviterWhite = Math.random() > 0.5;
      white = isInviterWhite ? invite.inviter : invite.invitee;
      black = isInviterWhite ? invite.invitee : invite.inviter;
    }

    db.prepare('INSERT INTO games (id, white, black, fen, createdAt, lastMoveAt, timeControl) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(gameId, white, black, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', Date.now(), Date.now(), invite.timeControl);

    return res.json({ gameId, status: 'accepted' });
  }

  res.json({ status });
});

// Get active games
app.get('/api/games/active/:address', (req, res) => {
  const { address } = req.params;
  const games = db.prepare("SELECT * FROM games WHERE (white = ? OR black = ?) AND status = 'active'").all(address, address);
  res.json(games);
});

// Get completed games
app.get('/api/games/completed/:address', (req, res) => {
  const { address } = req.params;
  const games = db.prepare("SELECT * FROM games WHERE (white = ? OR black = ?) AND status != 'active'").all(address, address);
  res.json(games);
});

// Get game by ID
app.get('/api/games/:id', (req, res) => {
  const { id } = req.params;
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  const moves = db.prepare('SELECT * FROM moves WHERE gameId = ? ORDER BY timestamp ASC').all(id);
  res.json({ ...game, moves });
});

// Resign
app.post('/api/games/:id/resign', (req, res) => {
  const { id } = req.params;
  const { address } = req.body;
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  const winner = address === game.white ? game.black : game.white;
  db.prepare('UPDATE games SET status = "resigned", winner = ? WHERE id = ?').run(winner, id);

  io.to(id).emit('gameOver', { status: 'resigned', winner });
  res.json({ status: 'resigned', winner });
});

// Draw
app.post('/api/games/:id/draw', (req, res) => {
  const { id } = req.params;
  db.prepare('UPDATE games SET status = "draw" WHERE id = ?').run(id);
  io.to(id).emit('gameOver', { status: 'draw' });
  res.json({ status: 'draw' });
});

// Timeout
app.post('/api/games/:id/timeout', (req, res) => {
  const { id } = req.params;
  const { winner } = req.body;
  db.prepare('UPDATE games SET status = "timeout", winner = ? WHERE id = ?').run(winner, id);
  io.to(id).emit('gameOver', { status: 'timeout', winner });
  res.json({ status: 'timeout', winner });
});

// Socket.io for real-time moves
io.on('connection', (socket) => {
  socket.on('joinGame', (gameId) => {
    socket.join(gameId);
  });

  socket.on('move', (data) => {
    const { gameId, move, fen } = data;

    db.prepare('UPDATE games SET fen = ?, lastMoveAt = ? WHERE id = ?').run(fen, Date.now(), gameId);
    db.prepare('INSERT INTO moves (gameId, move, fen, timestamp) VALUES (?, ?, ?, ?)').run(gameId, move, fen, Date.now());

    socket.to(gameId).emit('moveMade', data);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
