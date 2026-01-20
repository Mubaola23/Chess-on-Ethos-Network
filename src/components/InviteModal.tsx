import { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

export function InviteModal({ isOpen, onClose, onInvite, currentAddress }: {
  isOpen: boolean,
  onClose: () => void,
  onInvite: () => void,
  currentAddress: string
}) {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [timeControl, setTimeControl] = useState('600') // seconds
  const [color, setColor] = useState('random')
  const [isRated, setIsRated] = useState(false)

  if (!isOpen) return null

  const validateAddress = (addr: string) => {
    // Ethos/Sui addresses are 32 bytes (64 hex characters)
    return /^0x[a-fA-F0-9]{64}$/.test(addr) || addr.includes('.ethos');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return
    if (address === currentAddress) {
      toast.error('You cannot invite yourself')
      return
    }

    if (!validateAddress(address)) {
      toast.error('Invalid address format')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviter: currentAddress,
          invitee: address,
          timeControl: { initial: parseInt(timeControl), increment: 0 },
          color,
          rated: isRated
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invitation')
      }

      toast.success('Invitation sent!')
      onInvite()
      onClose()
      setAddress('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#262421] rounded-lg w-full max-w-md shadow-xl border border-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">Invite Player</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Opponent's Ethos Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x... or name.ethos"
              className="w-full bg-[#161512] border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Time Control</label>
              <select
                value={timeControl}
                onChange={(e) => setTimeControl(e.target.value)}
                className="w-full bg-[#161512] border border-gray-700 rounded px-3 py-2 text-sm"
              >
                <option value="600">10 min</option>
                <option value="900">15 min</option>
                <option value="1800">30 min</option>
                <option value="0">Unlimited</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Your Color</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-[#161512] border border-gray-700 rounded px-3 py-2 text-sm"
              >
                <option value="random">Random</option>
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rated"
              checked={isRated}
              onChange={(e) => setIsRated(e.target.checked)}
              className="w-4 h-4 bg-[#161512] border-gray-700 rounded"
            />
            <label htmlFor="rated" className="text-sm font-medium text-gray-400">Rated Game</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-700 rounded hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
