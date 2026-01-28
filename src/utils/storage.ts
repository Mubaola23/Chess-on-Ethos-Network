export interface LocalGame {
  id: string;
  white: string;
  black: string;
  fen: string;
  status: 'active' | 'checkmate' | 'draw' | 'resigned' | 'timeout';
  winner: string | null;
  timeControl: string;
  createdAt: number;
  lastMoveAt: number;
  moves: string[];
}

const STORAGE_KEY = 'ethos_chess_games';

export function getGames(address: string): LocalGame[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  const games: LocalGame[] = JSON.parse(stored);
  return games.filter(g => g.white === address || g.black === address);
}

export function getGameById(id: string): LocalGame | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const games: LocalGame[] = JSON.parse(stored);
  return games.find(g => g.id === id) || null;
}

export function saveGame(game: LocalGame) {
  const stored = localStorage.getItem(STORAGE_KEY);
  let games: LocalGame[] = stored ? JSON.parse(stored) : [];

  const index = games.findIndex(g => g.id === game.id);
  if (index >= 0) {
    games[index] = game;
  } else {
    games.push(game);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function createLocalAIGame(address: string, level: number): string {
  const id = crypto.randomUUID();
  const game: LocalGame = {
    id,
    white: address,
    black: `AI_LEVEL_${level}`,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    status: 'active',
    winner: null,
    timeControl: JSON.stringify({ initial: 600, increment: 0 }),
    createdAt: Date.now(),
    lastMoveAt: Date.now(),
    moves: []
  };

  saveGame(game);
  return id;
}
