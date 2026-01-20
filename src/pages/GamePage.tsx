import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { io, Socket } from 'socket.io-client'
import { useEthosWallet } from '../hooks'
import toast from 'react-hot-toast'
import { Flag, Handshake, User } from 'lucide-react'

interface GameData {
  id: string
  white: string
  black: string
  fen: string
  status: string
  winner: string | null
  moves: any[]
}

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const ethosWallet = useEthosWallet()
  const navigate = useNavigate()

  const [game, setGame] = useState(new Chess())
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [loading, setLoading] = useState(true)
  const [whiteTime, setWhiteTime] = useState(600)
  const [blackTime, setBlackTime] = useState(600)

  const fetchGame = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/games/${gameId}`)
      if (!response.ok) throw new Error('Game not found')
      const data = await response.json()
      setGameData(data)
      setGame(new Chess(data.fen))

      const settings = JSON.parse(data.timeControl || '{}')
      if (settings.initial) {
        setWhiteTime(settings.initial)
        setBlackTime(settings.initial)
      }
    } catch (_err: any) {
      toast.error('Failed to load game')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }, [gameId, navigate])

  useEffect(() => {
    fetchGame()

    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)

    newSocket.emit('joinGame', gameId)

    newSocket.on('moveMade', (data: { move: any, fen: string }) => {
      setGame(new Chess(data.fen))
    })

    newSocket.on('gameOver', (data: { status: string, winner: string | null }) => {
      toast.success(`Game Over: ${data.status}${data.winner ? ` (Winner: ${data.winner})` : ''}`)
      fetchGame()
    })

    return () => {
      newSocket.disconnect()
    }
  }, [gameId, fetchGame])

  useEffect(() => {
    if (!gameData || gameData.status !== 'active') return

    const settings = JSON.parse(gameData.timeControl || '{}')
    if (settings.initial === 0) return // Unlimited time

    const timer = setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteTime(t => Math.max(0, t - 1))
      } else {
        setBlackTime(t => Math.max(0, t - 1))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [gameData, game])

  useEffect(() => {
    if (whiteTime === 0 || blackTime === 0) {
      // In a real app, the server should detect this and end the game
      toast.error(`Time out! ${whiteTime === 0 ? 'Black' : 'White'} wins.`)
    }
  }, [whiteTime, blackTime])

  function makeAMove(move: any) {
    try {
      const gameCopy = new Chess(game.fen())
      const result = gameCopy.move(move)

      if (result) {
        setGame(gameCopy)
        socket?.emit('move', {
          gameId,
          move: result,
          fen: gameCopy.fen()
        })
        return true
      }
    } catch (_e) {
      return false
    }
    return false
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (!ethosWallet || !gameData) return false

    // Check if it's our turn
    const turn = game.turn() === 'w' ? 'white' : 'black'
    if (gameData[turn] !== ethosWallet) {
      toast.error("It's not your turn!")
      return false
    }

    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity
    })

    return move
  }

  const handleResign = async () => {
    if (!window.confirm('Are you sure you want to resign?')) return
    try {
      await fetch(`http://localhost:3001/api/games/${gameId}/resign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: ethosWallet })
      })
    } catch (_err) {
      toast.error('Failed to resign')
    }
  }

  const handleOfferDraw = async () => {
    if (!window.confirm('Offer a draw?')) return
    try {
      await fetch(`http://localhost:3001/api/games/${gameId}/draw`, {
        method: 'POST'
      })
    } catch (_err) {
      toast.error('Failed to offer draw')
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading game...</div>
  if (!gameData) return null

  const isWhite = ethosWallet === gameData.white
  const boardOrientation = isWhite ? 'white' : 'black'
  const opponentAddress = isWhite ? gameData.black : gameData.white
  const turn = game.turn() === 'w' ? 'White' : 'Black'
  const isMyTurn = (game.turn() === 'w' && isWhite) || (game.turn() === 'b' && !isWhite)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between bg-[#262421] p-3 rounded-t-lg border-x border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
              <User size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-sm">{opponentAddress.slice(0, 12)}...</p>
              <p className="text-xs text-gray-500">Opponent</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded font-mono text-xl ${(!isWhite && game.turn() === 'b') || (isWhite && game.turn() === 'w') ? 'bg-orange-600' : 'bg-gray-800'}`}>
            {formatTime(isWhite ? blackTime : whiteTime)}
          </div>
        </div>

        <div className="aspect-square w-full max-w-[600px] mx-auto shadow-2xl">
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardOrientation={boardOrientation}
            customDarkSquareStyle={{ backgroundColor: '#B58863' }}
            customLightSquareStyle={{ backgroundColor: '#F0D9B5' }}
          />
        </div>

        <div className="flex items-center justify-between bg-[#262421] p-3 rounded-b-lg border-x border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">You ({isWhite ? 'White' : 'Black'})</p>
              <p className="text-xs text-gray-500">{ethosWallet?.slice(0, 12)}...</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isMyTurn && <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">YOUR TURN</div>}
            <div className={`px-4 py-2 rounded font-mono text-xl ${isMyTurn ? 'bg-orange-600' : 'bg-gray-800'}`}>
              {formatTime(isWhite ? whiteTime : blackTime)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-[#262421] rounded-lg border border-gray-800 flex flex-col h-[400px]">
          <div className="p-4 border-b border-gray-800 font-bold flex items-center justify-between">
            <span>Move History ({game.history().length} moves)</span>
            <span className="text-xs text-gray-500">{turn}'s turn</span>
          </div>
          <div className="flex-1 overflow-auto p-4">
             <div className="grid grid-cols-2 gap-2">
                {game.history().map((move, i) => (
                  <div key={i} className={`p-1 rounded text-sm ${i % 2 === 0 ? 'bg-gray-800/50' : ''}`}>
                    <span className="text-gray-500 mr-2">{Math.floor(i/2) + 1}.</span>
                    {move}
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleOfferDraw}
            disabled={gameData.status !== 'active'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#302e2c] hover:bg-[#383634] rounded font-bold transition-colors disabled:opacity-50"
          >
            <Handshake size={20} />
            Draw
          </button>
          <button
            onClick={handleResign}
            disabled={gameData.status !== 'active'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#302e2c] hover:bg-red-900/40 hover:text-red-500 rounded font-bold transition-colors disabled:opacity-50"
          >
            <Flag size={20} />
            Resign
          </button>
        </div>

        {gameData.status !== 'active' && (
          <div className="bg-blue-600 p-4 rounded-lg text-center">
            <p className="font-bold text-lg mb-2">Game Over</p>
            <p className="text-sm opacity-90 mb-4">
              Result: {gameData.status} {gameData.winner && `(Winner: ${gameData.winner === ethosWallet ? 'You' : 'Opponent'})`}
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 bg-white text-blue-600 rounded font-bold hover:bg-gray-100 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
