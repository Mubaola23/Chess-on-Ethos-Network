import React, { useEffect, useState } from 'react';
import { useEthos } from '../hooks/useEthos';
import { Check, X, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvitationsPage: React.FC = () => {
  const { address } = useEthos();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [invitations, setInvitations] = useState<{ received: any[]; sent: any[] }>({ received: [], sent: [] });
  const navigate = useNavigate();

  const fetchInvitations = async () => {
    if (!address) return;
    const res = await fetch(`http://localhost:3001/api/invitations/${address}`);
    const data = await res.json();
    setInvitations(data);
  };

  useEffect(() => {
    fetchInvitations();
    const interval = setInterval(fetchInvitations, 5000);
    return () => clearInterval(interval);
  }, [address]);

  const handleRespond = async (id: string, status: 'accepted' | 'declined') => {
    const res = await fetch(`http://localhost:3001/api/invitations/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (status === 'accepted' && data.gameId) {
      navigate(`/game/${data.gameId}`);
    } else {
      fetchInvitations();
    }
  };

  const truncate = (str: string) => `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Invitations</h1>

      <div className="flex mb-6 border-b dark:border-gray-700">
        <button
          className={`p-4 ${activeTab === 'received' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('received')}
        >
          Received ({invitations.received.length})
        </button>
        <button
          className={`p-4 ${activeTab === 'sent' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent ({invitations.sent.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'received' ? (
          invitations.received.length === 0 ? (
            <p className="text-gray-500 italic">No pending invitations.</p>
          ) : (
            invitations.received.map((inv) => (
              <div key={inv.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold dark:text-white">From: {truncate(inv.inviter)}</span>
                    <button onClick={() => navigator.clipboard.writeText(inv.inviter)} className="text-gray-400 hover:text-gray-600">
                      <Copy size={16} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {JSON.parse(inv.timeControl).initial / 60}m • {inv.rated ? 'Rated' : 'Casual'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(inv.id, 'accepted')}
                    className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => handleRespond(inv.id, 'declined')}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          invitations.sent.length === 0 ? (
            <p className="text-gray-500 italic">No sent invitations.</p>
          ) : (
            invitations.sent.map((inv) => (
              <div key={inv.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-between">
                <div>
                  <div className="font-semibold dark:text-white">To: {truncate(inv.invitee)}</div>
                  <div className="text-sm text-gray-500">
                    Status: <span className="capitalize">{inv.status}</span> • {JSON.parse(inv.timeControl).initial / 60}m
                  </div>
                </div>
                {inv.status === 'pending' && (
                   <button className="text-red-500 text-sm hover:underline">Cancel</button>
                )}
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default InvitationsPage;
