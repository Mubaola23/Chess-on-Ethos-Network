import { useState, useEffect, useCallback } from 'react'
import { useEthosWallet } from '../hooks'
import { Bot, Play, History, Trophy, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getGames, createLocalAIGame } from '../utils/storage'

export function Dashboard() {
  const ethosWallet = useEthosWallet()
  const navigate = useNavigate()
  const [activeGames, setActiveGames] = useState<any[]>([])
  const [completedGames, setCompletedGames] = useState<any[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const fetchData = useCallback(() => {
    if (!ethosWallet) return
    const allGames = getGames(ethosWallet)
    setActiveGames(allGames.filter(g => g.status === 'active'))
    setCompletedGames(allGames.filter(g => g.status !== 'active'))
  }, [ethosWallet])

  useEffect(() => {
    let cancelled = false
    if (!cancelled) {
      fetchData()
    }
    return () => {
      cancelled = true
    }
  }, [fetchData])

  const startAIGame = () => {
    if (isCreating || !ethosWallet) return
    setIsCreating(true)
    const id = createLocalAIGame(ethosWallet, 1)
    navigate(`/game/${id}`)
    setIsCreating(false)
  }

  if (!ethosWallet) return <div className="p-8 text-center">Please connect your wallet</div>

  return (
    <div className="w-full p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Welcome!</h1>
          <p className="text-gray-400 font-mono text-sm">{ethosWallet}</p>
        </div>
        <button
          onClick={startAIGame}
          disabled={isCreating}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
        >
          <Bot size={20} />
          {isCreating ? 'Creating...' : 'Play Computer'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Play className="text-green-500" />
            <h2>Active Games</h2>
            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full">{activeGames.length}</span>
          </div>

          <div className="space-y-3">
            {activeGames.length === 0 ? (
              <div className="bg-[#262421] rounded-xl p-8 text-center border border-gray-800 border-dashed">
                <p className="text-gray-500">No active games. Start one!</p>
              </div>
            ) : (
              activeGames.map((game: any) => (
                <div key={game.id} className="bg-[#262421] rounded-xl p-4 flex items-center justify-between border border-gray-800 hover:border-gray-700 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                      <User size={24} className="text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <div>
                      <p className="font-bold">vs {game.white === ethosWallet ? game.black.slice(0, 10) : game.white.slice(0, 10)}...</p>
                      <p className="text-xs text-gray-500">Last move: {new Date(game.lastMoveAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/game/${game.id}`)}
                    className="px-4 py-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-all border border-blue-600/20"
                  >
                    Play
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <History className="text-yellow-500" />
            <h2>Recent Games</h2>
          </div>

          <div className="space-y-3">
            {completedGames.length === 0 ? (
              <div className="bg-[#262421] rounded-xl p-8 text-center border border-gray-800 border-dashed">
                <p className="text-gray-500">No completed games yet.</p>
              </div>
            ) : (
              completedGames.map((game: any) => (
                <div key={game.id} className="bg-[#262421] rounded-xl p-4 flex items-center justify-between border border-gray-800 opacity-80">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Trophy size={24} className={game.winner === ethosWallet ? "text-yellow-500" : "text-gray-500"} />
                    </div>
                    <div>
                      <p className="font-bold">vs {game.white === ethosWallet ? game.black.slice(0, 10) : game.white.slice(0, 10)}...</p>
                      <p className="text-xs text-gray-500">{game.status} • {new Date(game.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${game.winner === ethosWallet ? 'text-green-500' : game.winner ? 'text-red-500' : 'text-gray-500'}`}>
                    {game.winner === ethosWallet ? 'WIN' : game.winner ? 'LOSS' : 'DRAW'}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

    </div>
  )
}
