import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ApiService } from '../services/ApiService';

export const useChessGame = (gameId: string, playerAddress: string | null) => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = useCallback(async () => {
    try {
      const data = await ApiService.getGame(gameId);
      setGameState(data);
      setGame(new Chess(data.fen));
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 3000);
    return () => clearInterval(interval);
  }, [fetchGame]);

  const makeMove = async (move: any) => {
    if (!playerAddress) return false;

    try {
      const data = await ApiService.makeMove(gameId, move, playerAddress);
      if (data.error) throw new Error(data.error);

      fetchGame();
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  };

  const resign = async () => {
    if (!playerAddress) return;
    await ApiService.resignGame(gameId, playerAddress);
    fetchGame();
  };

  return {
    game,
    gameState,
    loading,
    error,
    makeMove,
    resign,
    isMyTurn: gameState?.currentTurn === (gameState?.white === playerAddress ? 'white' : 'black'),
    playerColor: gameState?.white === playerAddress ? 'white' : 'black'
  };
};
