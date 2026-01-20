import React, { useState } from 'react';
import { X } from 'lucide-react';

interface InvitePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: { invitee: string; timeControl: any; rated: boolean; colorPreference: string }) => void;
}

const InvitePlayerModal: React.FC<InvitePlayerModalProps> = ({ isOpen, onClose, onInvite }) => {
  const [address, setAddress] = useState('');
  const [timeControl, setTimeControl] = useState('10'); // minutes
  const [rated, setRated] = useState(false);
  const [color, setColor] = useState('random');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite({
      invitee: address,
      timeControl: { initial: parseInt(timeControl) * 60, increment: 0 },
      rated,
      colorPreference: color,
    });
    setAddress('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Invite Player</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Opponent's Ethos Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Time Control</label>
            <select
              value={timeControl}
              onChange={(e) => setTimeControl(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="5">5 min</option>
              <option value="10">10 min</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Color Preference</label>
            <div className="flex gap-4">
              <label className="flex items-center dark:text-gray-300">
                <input type="radio" value="white" checked={color === 'white'} onChange={() => setColor('white')} className="mr-2" />
                White
              </label>
              <label className="flex items-center dark:text-gray-300">
                <input type="radio" value="black" checked={color === 'black'} onChange={() => setColor('black')} className="mr-2" />
                Black
              </label>
              <label className="flex items-center dark:text-gray-300">
                <input type="radio" value="random" checked={color === 'random'} onChange={() => setColor('random')} className="mr-2" />
                Random
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center dark:text-gray-300">
              <input type="checkbox" checked={rated} onChange={(e) => setRated(e.target.checked)} className="mr-2" />
              Rated Game
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-2 bg-gray-200 dark:bg-gray-700 rounded dark:text-white hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvitePlayerModal;
