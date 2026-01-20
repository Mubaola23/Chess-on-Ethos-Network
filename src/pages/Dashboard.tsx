import React, { useEffect, useState } from 'react';
import { useEthos } from '../hooks/useEthos';
import { ApiService } from '../services/ApiService';
import { useNavigate } from 'react-router-dom';
import { Plus, Bell } from 'lucide-react';
import InvitePlayerModal from '../components/InvitePlayerModal';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { address, authenticated, login } = useEthos();
  const [activeGames, setActiveGames] = useState<any[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchGames = async () => {
    if (!address) return;
    try {
      const data = await ApiService.getActiveGames(address);
      setActiveGames(data.filter((g: any) => g.status === 'active'));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (address) {
      fetchGames();
    }
  }, [address]);

  const handleInvite = async (data: any) => {
    setLoading(true);
    try {
      const res = await ApiService.sendInvitation({ ...data, inviter: address });
      if (res.error) throw new Error(res.error);
      toast.success('Invitation sent successfully!');
      fetchGames();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold mb-8 dark:text-white text-center">Ethos Chess</h1>
        <button
          onClick={login}
          className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg"
        >
          Login with Ethos
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">My Games</h1>
          <p className="text-gray-500 text-sm">{address.substring(0, 10)}...</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/invitations')}
            className="p-2 relative bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-50 transition"
          >
            <Bell className="dark:text-white" />
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold shadow-md"
          >
            <Plus size={20} /> New Game
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeGames.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 mb-4">No active games found.</p>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full font-bold hover:bg-blue-100 transition"
            >
              Challenge someone
            </button>
          </div>
        ) : (
          activeGames.map((game) => (
            <div
              key={game.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/game/${game.id}`)}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase bg-green-50 text-green-600 px-2 py-1 rounded">Active</span>
                <span className="text-xs text-gray-400">{new Date(game.lastMoveAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between mb-6">
                 <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">W</div>
                    <span className="text-xs font-bold dark:text-white">{game.white === address ? 'You' : 'Opponent'}</span>
                 </div>
                 <div className="text-gray-200 font-bold">VS</div>
                 <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">B</div>
                    <span className="text-xs font-bold dark:text-white">{game.black === address ? 'You' : 'Opponent'}</span>
                 </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                <div className="text-sm">
                   {game.currentTurn === (game.white === address ? 'white' : 'black') ? (
                     <span className="text-blue-600 font-bold">Your turn</span>
                   ) : (
                     <span className="text-gray-400">Opponent's turn</span>
                   )}
                </div>
                <button className="text-sm font-bold text-blue-600 hover:underline">Play Now →</button>
              </div>
            </div>
          ))
        )}
      </div>

      <InvitePlayerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
      />
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[60]">
           <div className="bg-white p-4 rounded-lg shadow-xl flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
              <span className="font-bold">Sending...</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
