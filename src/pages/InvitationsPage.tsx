import { useState, useEffect, useCallback } from 'react'
import { useEthosWallet } from '../hooks'
import { Check, X, Copy, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface Invitation {
  id: string
  inviter: string
  invitee: string
  status: string
  createdAt: number
  timeControl: string
}

export function InvitationsPage() {
  const ethosWallet = useEthosWallet()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [invitations, setInvitations] = useState<{ received: Invitation[], sent: Invitation[] }>({ received: [], sent: [] })
  const [loading, setLoading] = useState(true)

  const fetchInvitations = useCallback(async () => {
    if (!ethosWallet) return
    try {
      const response = await fetch(`/api/invitations/${ethosWallet}`)
      if (!response.ok) throw new Error('Failed to fetch invitations')
      const data = await response.json()
      setInvitations(data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [ethosWallet])

  useEffect(() => {
    fetchInvitations()
    const interval = setInterval(fetchInvitations, 5000)
    return () => clearInterval(interval)
  }, [fetchInvitations])

  const handleRespond = async (id: string, status: 'accepted' | 'declined') => {
    try {
      const response = await fetch('/api/invitations/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (!response.ok) throw new Error('Failed to respond to invitation')

      const data = await response.json()
      if (status === 'accepted') {
        toast.success('Invitation accepted! Starting game...')
        navigate(`/game/${data.gameId}`)
      } else {
        toast.success('Invitation declined')
        fetchInvitations()
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr)
    toast.success('Address copied!')
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading invitations...</div>

  const currentList = activeTab === 'received' ? invitations.received : invitations.sent

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Invitations</h1>
        <div className="flex bg-[#262421] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'received' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Received {invitations.received.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{invitations.received.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'sent' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Sent
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="bg-[#262421] rounded-lg p-12 text-center border border-gray-800">
            <p className="text-gray-400 text-lg">No {activeTab} invitations</p>
          </div>
        ) : (
          currentList.map((invite) => (
            <div key={invite.id} className="bg-[#262421] rounded-lg p-4 flex items-center justify-between border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{activeTab === 'received' ? 'From:' : 'To:'}</span>
                  <span className="font-mono text-blue-400">{activeTab === 'received' ? invite.inviter.slice(0, 10) + '...' + invite.inviter.slice(-4) : invite.invitee.slice(0, 10) + '...' + invite.invitee.slice(-4)}</span>
                  <button onClick={() => copyAddress(activeTab === 'received' ? invite.inviter : invite.invitee)} className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-500">
                    <Copy size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{new Date(invite.createdAt).toLocaleString()}</span>
                  </div>
                  <span>10m | Casual</span>
                </div>
              </div>

              {activeTab === 'received' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(invite.id, 'accepted')}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold transition-colors"
                  >
                    <Check size={18} />
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(invite.id, 'declined')}
                    className="flex items-center gap-1 px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded font-bold border border-red-600/30 transition-all"
                  >
                    <X size={18} />
                    Decline
                  </button>
                </div>
              )}

              {activeTab === 'sent' && (
                <span className="px-3 py-1 bg-yellow-600/20 text-yellow-500 text-sm rounded-full border border-yellow-600/30">
                  {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
