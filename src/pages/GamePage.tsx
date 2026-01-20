import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEthos } from '../hooks/useEthos';
import { useChessGame } from '../hooks/useChessGame';
import ChessBoard from '../components/ChessBoard';
import GameInfoPanel from '../components/GameInfoPanel';
import { ChevronLeft } from 'lucide-react';

const GamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { address } = useEthos();
  const navigate = useNavigate();
  const { gameState, loading, error, resign } = useChessGame(id!, address);

  if (loading) return <div className="p-8 text-center dark:text-white">Loading game...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full max-w-[600px] mx-auto lg:mx-0">
          <ChessBoard gameId={id!} playerAddress={address} />
        </div>
        <div className="w-full lg:w-96">
          <GameInfoPanel
            gameState={gameState}
            playerAddress={address}
            onResign={resign}
          />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
