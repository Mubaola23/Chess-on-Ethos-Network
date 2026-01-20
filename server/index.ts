import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Chess } from 'chess.js';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Invitations API
app.post('/api/invitations', (req, res) => {
  const { inviter, invitee, timeControl, rated, colorPreference } = req.body;
  if (inviter === invitee) return res.status(400).json({ error: "Cannot invite yourself" });

  const id = uuidv4();
  const createdAt = Date.now();
  const expiresAt = createdAt + 24 * 60 * 60 * 1000;

  const stmt = db.prepare('INSERT INTO invitations (id, inviter, invitee, timeControl, rated, colorPreference, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, inviter, invitee, JSON.stringify(timeControl), rated ? 1 : 0, colorPreference, createdAt, expiresAt);

  res.json({ id, status: 'pending' });
});

app.get('/api/invitations/:address', (req, res) => {
  const { address } = req.params;
  const received = db.prepare('SELECT * FROM invitations WHERE invitee = ? AND status = "pending"').all(address);
  const sent = db.prepare('SELECT * FROM invitations WHERE inviter = ?').all(address);
  res.json({ received, sent });
});

app.post('/api/invitations/:id/respond', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'accepted' or 'declined'

  const invitation = db.prepare('SELECT * FROM invitations WHERE id = ?').get(id) as any;
  if (!invitation) return res.status(404).json({ error: "Invitation not found" });

  db.prepare('UPDATE invitations SET status = ? WHERE id = ?').run(status, id);

  if (status === 'accepted') {
    const gameId = uuidv4();
    let white, black;
    if (invitation.colorPreference === 'white') {
      white = invitation.inviter;
      black = invitation.invitee;
    } else if (invitation.colorPreference === 'black') {
      white = invitation.invitee;
      black = invitation.inviter;
    } else {
      const isInviterWhite = Math.random() > 0.5;
      white = isInviterWhite ? invitation.inviter : invitation.invitee;
      black = isInviterWhite ? invitation.invitee : invitation.inviter;
    }

    const chess = new Chess();
    const now = Date.now();
    const stmt = db.prepare('INSERT INTO games (id, white, black, fen, moves, status, currentTurn, timeControl, createdAt, lastMoveAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(gameId, white, black, chess.fen(), JSON.stringify([]), 'active', 'white', invitation.timeControl, now, now);

    return res.json({ status: 'accepted', gameId });
  }

  res.json({ status });
});

// Games API
app.get('/api/games/:id', (req, res) => {
  const { id } = req.params;
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(id) as any;
  if (!game) return res.status(404).json({ error: "Game not found" });
  res.json({ ...game, moves: JSON.parse(game.moves), timeControl: JSON.parse(game.timeControl) });
});

app.get('/api/users/:address/games', (req, res) => {
  const { address } = req.params;
  const games = db.prepare('SELECT * FROM games WHERE white = ? OR black = ? ORDER BY lastMoveAt DESC').all(address, address);
  res.json(games.map((g: any) => ({ ...g, moves: JSON.parse(g.moves), timeControl: JSON.parse(g.timeControl) })));
});

app.post('/api/games/:id/move', (req, res) => {
  const { id } = req.params;
  const { move, playerAddress } = req.body;

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(id) as any;
  if (!game) return res.status(404).json({ error: "Game not found" });
  if (game.status !== 'active') return res.status(400).json({ error: "Game is over" });

  const isWhite = game.white === playerAddress;
  const isBlack = game.black === playerAddress;
  if (!isWhite && !isBlack) return res.status(403).json({ error: "Not a player in this game" });
  if ((game.currentTurn === 'white' && !isWhite) || (game.currentTurn === 'black' && !isBlack)) {
    return res.status(400).json({ error: "Not your turn" });
  }

  const chess = new Chess(game.fen);
  try {
    const result = chess.move(move);
    if (!result) throw new Error("Invalid move");

    const moves = JSON.parse(game.moves);
    moves.push(result.san);

    let status = 'active';
    let winner = null;
    if (chess.isCheckmate()) {
      status = 'checkmate';
      winner = playerAddress;
    } else if (chess.isDraw()) {
      status = 'draw';
    } else if (chess.isStalemate()) {
      status = 'stalemate';
    }

    const nextTurn = chess.turn() === 'w' ? 'white' : 'black';
    const now = Date.now();

    db.prepare('UPDATE games SET fen = ?, moves = ?, status = ?, winner = ?, currentTurn = ?, lastMoveAt = ? WHERE id = ?')
      .run(chess.fen(), JSON.stringify(moves), status, winner, nextTurn, now, id);

    res.json({ success: true, fen: chess.fen(), status, winner });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/games/:id/resign', (req, res) => {
  const { id } = req.params;
  const { playerAddress } = req.body;
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(id) as any;
  if (!game) return res.status(404).json({ error: "Game not found" });

  const winner = game.white === playerAddress ? game.black : game.white;
  db.prepare('UPDATE games SET status = "resigned", winner = ? WHERE id = ?').run(winner, id);
  res.json({ success: true, status: 'resigned', winner });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
