import { Chess } from 'chess.js'

/**
 * A very simple minimax-based chess AI for evaluation.
 * In a real-world app, you might use a Web Worker with Stockfish.
 */

const pieceValues: Record<string, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900
};

function evaluateBoard(game: Chess): number {
  let totalEvaluation = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      totalEvaluation += getPieceValue(board[i][j]);
    }
  }
  return totalEvaluation;
}

function getPieceValue(piece: { type: string; color: string } | null): number {
  if (piece === null) return 0;
  const val = pieceValues[piece.type] || 0;
  return piece.color === 'w' ? val : -val;
}

export function getBestMove(game: Chess): string {
  const possibleMoves = game.moves();
  if (possibleMoves.length === 0) return '';

  // Random move if no brain
  let bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  let bestValue = game.turn() === 'w' ? -Infinity : Infinity;

  for (const move of possibleMoves) {
    game.move(move);
    const boardValue = evaluateBoard(game);
    game.undo();

    if (game.turn() === 'w') {
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    } else {
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
  }

  return bestMove;
}
