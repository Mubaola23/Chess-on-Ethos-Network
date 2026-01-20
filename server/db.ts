import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'chess.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    inviter TEXT NOT NULL,
    invitee TEXT NOT NULL,
    timeControl TEXT NOT NULL,
    rated INTEGER NOT NULL,
    colorPreference TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    createdAt INTEGER NOT NULL,
    expiresAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    white TEXT NOT NULL,
    black TEXT NOT NULL,
    fen TEXT NOT NULL,
    moves TEXT NOT NULL,
    status TEXT NOT NULL,
    winner TEXT,
    currentTurn TEXT NOT NULL,
    timeControl TEXT,
    whiteTime INTEGER,
    blackTime INTEGER,
    createdAt INTEGER NOT NULL,
    lastMoveAt INTEGER NOT NULL
  );
`);

export default db;
