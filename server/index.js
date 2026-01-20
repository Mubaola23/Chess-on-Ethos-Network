import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import db from './db.js';
import crypto from 'node:crypto';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const generateId = () => crypto.randomUUID();

// API Endpoints

// Create AI Game
app.post('/api/games/ai', (req, res) => {
  const { address, level } = req.body;
  const gameId = generateId();

  const white = address;
  const black = 'AI_LEVEL_' + (level || 1);
  const timeControl = JSON.stringify({ initial: 600, increment: 0 });

  db.prepare('INSERT INTO games (id, white, black, fen, createdAt, lastMoveAt, timeControl) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(gameId, white, black, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', Date.now(), Date.now(), timeControl);

  res.json({ id: gameId });
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

  res.json({ status: 'resigned', winner });
});

// Draw
app.post('/api/games/:id/draw', (req, res) => {
  const { id } = req.params;
  db.prepare('UPDATE games SET status = "draw" WHERE id = ?').run(id);
  res.json({ status: 'draw' });
});

// Game Over (Checkmate or Timeout)
app.post('/api/games/:id/timeout', (req, res) => {
  const { id } = req.params;
  const { winner, status } = req.body;
  db.prepare('UPDATE games SET status = ?, winner = ? WHERE id = ?').run(status || 'timeout', winner, id);
  res.json({ status: status || 'timeout', winner });
});

// Update game (for AI moves or local moves)
app.post('/api/games/:id/move', (req, res) => {
  const { id } = req.params;
  const { move, fen } = req.body;

  db.prepare('UPDATE games SET fen = ?, lastMoveAt = ? WHERE id = ?').run(fen, Date.now(), id);
  db.prepare('INSERT INTO moves (gameId, move, fen, timestamp) VALUES (?, ?, ?, ?)').run(id, JSON.stringify(move), fen, Date.now());

  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
