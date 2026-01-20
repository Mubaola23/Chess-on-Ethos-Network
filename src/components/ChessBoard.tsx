import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from '../hooks/useChessGame';

interface ChessBoardProps {
  gameId: string;
  playerAddress: string | null;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ gameId, playerAddress }) => {
  const { game, gameState, makeMove, isMyTurn, playerColor } = useChessGame(gameId, playerAddress);

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (!isMyTurn) return false;

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity
    };

    return makeMove(move);
  }

  if (!gameState) return <div className="dark:text-white">Loading board...</div>;

  return (
    <div className="w-full max-w-[600px] aspect-square">
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={playerColor as any}
        customDarkSquareStyle={{ backgroundColor: '#B58863' }}
        customLightSquareStyle={{ backgroundColor: '#F0D9B5' }}
      />
    </div>
  );
};

export default ChessBoard;
