import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'chess.db');

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    inviter TEXT NOT NULL,
    invitee TEXT NOT NULL,
    timeControl TEXT,
    status TEXT DEFAULT 'pending',
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    white TEXT NOT NULL,
    black TEXT NOT NULL,
    fen TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    winner TEXT,
    timeControl TEXT,
    createdAt INTEGER NOT NULL,
    lastMoveAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS moves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gameId TEXT NOT NULL,
    move TEXT NOT NULL,
    fen TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (gameId) REFERENCES games(id)
  );
`);

export default db;
