import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';

describe('Chess Logic', () => {
  it('should initialize with starting position', () => {
    const chess = new Chess();
    expect(chess.fen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });

  it('should allow valid moves', () => {
    const chess = new Chess();
    const move = chess.move('e4');
    expect(move).toBeDefined();
    expect(chess.turn()).toBe('b');
  });

  it('should detect checkmate', () => {
    const chess = new Chess();
    chess.move('f3');
    chess.move('e5');
    chess.move('g4');
    chess.move('Qh4');
    expect(chess.isCheckmate()).toBe(true);
  });
});
