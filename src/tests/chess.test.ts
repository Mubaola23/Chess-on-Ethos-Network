import { describe, it, expect } from 'vitest'
import { Chess } from 'chess.js'

describe('Chess Logic', () => {
  it('should initialize a standard game', () => {
    const chess = new Chess()
    expect(chess.fen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  })

  it('should validate legal moves', () => {
    const chess = new Chess()
    const move = chess.move({ from: 'e2', to: 'e4' })
    expect(move).not.toBeNull()
    expect(chess.turn()).toBe('b')
  })

  it('should detect checkmate', () => {
    const chess = new Chess()
    // Fool's Mate
    chess.move('f3')
    chess.move('e5')
    chess.move('g4')
    chess.move('Qh4')
    expect(chess.isCheckmate()).toBe(true)
  })

  it('should handle castling', () => {
    const chess = new Chess('rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1')
    const move = chess.move('O-O')
    expect(move).not.toBeNull()
    // White king should move to g1 and rook to f1
    expect(chess.get('g1')?.type).toBe('k')
    expect(chess.get('f1')?.type).toBe('r')
  })
})
