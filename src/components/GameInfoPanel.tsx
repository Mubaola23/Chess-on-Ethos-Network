import React, { useEffect, useState } from 'react';
import { Chess, PieceSymbol, Color } from 'chess.js';

interface GameInfoPanelProps {
  gameState: any;
  playerAddress: string | null;
  onResign: () => void;
}

const GameInfoPanel: React.FC<GameInfoPanelProps> = ({ gameState, playerAddress, onResign }) => {
  const [timeLeft, setTimeLeft] = useState<{ white: number; black: number }>({ white: 0, black: 0 });

  useEffect(() => {
    if (gameState && gameState.status === 'active') {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - gameState.lastMoveAt) / 1000);

        setTimeLeft(prev => {
          const newState = { ...prev };
          if (gameState.currentTurn === 'white') {
            newState.white = Math.max(0, (gameState.whiteTime || 600) - elapsed);
          } else {
            newState.black = Math.max(0, (gameState.blackTime || 600) - elapsed);
          }
          return newState;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  if (!gameState) return null;

  const isWhite = gameState.white === playerAddress;
  const truncate = (str: string) => `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;

  const chess = new Chess(gameState.fen);
  const history = gameState.moves;

  // Calculate captured pieces and material advantage
  const getCapturedPieces = () => {
    const board = chess.board();
    const currentPieces: Record<string, number> = {};
    board.flat().forEach(piece => {
      if (piece) {
        const key = `${piece.color}${piece.type}`;
        currentPieces[key] = (currentPieces[key] || 0) + 1;
      }
    });

    const startingPieces: Record<string, number> = {
      wp: 8, wn: 2, wb: 2, wr: 2, wq: 1,
      bp: 8, bn: 2, bb: 2, br: 2, bq: 1
    };

    const captured: { white: string[]; black: string[] } = { white: [], black: [] };
    const values: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let advantage = 0;

    Object.keys(startingPieces).forEach(key => {
      const count = startingPieces[key] - (currentPieces[key] || 0);
      const color = key[0] === 'w' ? 'white' : 'black';
      const type = key[1] as PieceSymbol;
      for (let i = 0; i < count; i++) {
        captured[color].push(type);
        advantage += (color === 'white' ? -1 : 1) * values[type];
      }
    });

    return { captured, advantage };
  };

  const { captured, advantage } = getCapturedPieces();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full border border-gray-100 dark:border-gray-700">
      <div className="mb-6 pb-6 border-b dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
           Players
        </h3>
        <div className="space-y-4">
          {/* Opponent (Top) */}
          <div className={`p-3 rounded-lg border ${gameState.currentTurn === (isWhite ? 'black' : 'white') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-transparent'}`}>
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black uppercase text-gray-400">Opponent ({isWhite ? 'Black' : 'White'})</span>
                <span className="font-mono font-bold text-lg dark:text-white">{formatTime(isWhite ? timeLeft.black : timeLeft.white)}</span>
             </div>
             <div className="font-mono text-sm dark:text-white mb-2">{truncate(isWhite ? gameState.black : gameState.white)}</div>
             <div className="flex gap-1 h-5">
                {captured[isWhite ? 'white' : 'black'].map((p, i) => (
                  <span key={i} className="text-gray-400 uppercase text-xs">{p}</span>
                ))}
                {advantage < 0 && isWhite && <span className="text-xs font-bold text-green-500">+{Math.abs(advantage)}</span>}
                {advantage > 0 && !isWhite && <span className="text-xs font-bold text-green-500">+{Math.abs(advantage)}</span>}
             </div>
          </div>

          <div className="text-center font-black text-gray-200">VS</div>

          {/* You (Bottom) */}
          <div className={`p-3 rounded-lg border ${gameState.currentTurn === (isWhite ? 'white' : 'black') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-transparent'}`}>
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black uppercase text-gray-400">You ({isWhite ? 'White' : 'Black'})</span>
                <span className="font-mono font-bold text-lg dark:text-white">{formatTime(isWhite ? timeLeft.white : timeLeft.black)}</span>
             </div>
             <div className="font-mono text-sm dark:text-white mb-2">{truncate(playerAddress || '')}</div>
             <div className="flex gap-1 h-5">
                {captured[isWhite ? 'black' : 'white'].map((p, i) => (
                  <span key={i} className="text-gray-400 uppercase text-xs">{p}</span>
                ))}
                {advantage > 0 && isWhite && <span className="text-xs font-bold text-green-500">+{advantage}</span>}
                {advantage < 0 && !isWhite && <span className="text-xs font-bold text-green-500">+{Math.abs(advantage)}</span>}
             </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 dark:text-white">Move History</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-h-48 overflow-y-auto font-mono text-xs">
          {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex justify-between dark:text-gray-300 py-1 border-b border-gray-50 dark:border-gray-700/50">
                <span className="text-gray-400 w-6">{i + 1}.</span>
                <span className="font-bold flex-1">{history[i * 2]}</span>
              </div>
              <div className="flex justify-between dark:text-gray-300 py-1 border-b border-gray-50 dark:border-gray-700/50">
                <span className="font-bold flex-1">{history[i * 2 + 1] || ''}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {gameState.status === 'active' && (
          <button
            onClick={onResign}
            className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold transition shadow-sm"
          >
            Resign
          </button>
        )}
        <button className="p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl hover:bg-gray-200 transition font-bold shadow-sm">
          Offer Draw
        </button>
      </div>

      {gameState.status !== 'active' && (
        <div className={`mt-6 p-4 rounded-xl text-center shadow-inner ${gameState.status === 'checkmate' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
          <div className="font-black text-xs uppercase tracking-widest mb-1 ${gameState.status === 'checkmate' ? 'text-red-600' : 'text-yellow-600'}`">
            Game Over
          </div>
          <div className="text-lg font-bold dark:text-white">
            {gameState.status === 'checkmate' ? `Winner: ${truncate(gameState.winner || '')}` : gameState.status.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInfoPanel;
