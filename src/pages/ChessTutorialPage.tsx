import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, User, Shield, Crown } from 'lucide-react'

export function ChessTutorialPage() {
  return (
    <div className="min-h-screen bg-[#161512] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <BookOpen className="text-blue-500" size={40} />
            How to Play CredChess
          </h1>
          <p className="text-xl text-gray-400 mt-2">
            Master the game of kings and queens on the blockchain.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1: The Objective */}
          <section className="bg-[#262421] p-8 rounded-2xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-yellow-500 flex items-center gap-2">
              <Crown size={28} />
              The Objective
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              The ultimate goal of chess is to <strong className="text-white">checkmate</strong> your opponent's King.
              Checkmate occurs when the King is under attack (in "check") and has no legal move to escape.
              The game can also end in a draw (stalemate, insufficient material, repetition) or if a player resigns.
            </p>
          </section>

          {/* Section 2: The Pieces */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-800 pb-2">The Pieces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieceCard
                name="Pawn"
                desc="Moves forward one square (or two on the first move). Captures diagonally."
              />
              <PieceCard
                name="Rook"
                desc="Moves any number of squares horizontally or vertically."
              />
              <PieceCard
                name="Knight"
                desc="Moves in an 'L' shape: two squares in one direction, then one perpendicular. Can jump over other pieces."
              />
              <PieceCard
                name="Bishop"
                desc="Moves any number of squares diagonally."
              />
              <PieceCard
                name="Queen"
                desc="The most powerful piece. Combines the movement of the Rook and Bishop."
              />
              <PieceCard
                name="King"
                desc="Moves one square in any direction. Protect your King at all costs!"
              />
            </div>
          </section>

          {/* Section 3: Ethos Integration */}
          <section className="bg-blue-900/10 p-8 rounded-2xl border border-blue-900/30">
            <h2 className="text-2xl font-bold mb-4 text-blue-400 flex items-center gap-2">
              <Shield size={28} />
              Ethos & Reputation
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              CredChess isn't just about winning; it's about building your on-chain reputation.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong className="text-white">Identity:</strong> Your Ethos profile is your player card.</li>
              <li><strong className="text-white">Credibility Score:</strong> Wins and fair play contribute to your score.</li>
              <li><strong className="text-white">History:</strong> All games are recorded and tied to your digital identity.</li>
            </ul>
          </section>

          {/* Section 4: Getting Started */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <User size={28} className="text-green-500" />
              How to Start
            </h2>
            <ol className="list-decimal list-inside space-y-4 text-gray-300 text-lg">
              <li>Log in using your Ethos account via the <strong>Log in</strong> button.</li>
              <li>Go to your <strong>Dashboard</strong>.</li>
              <li>Click <strong>Play Computer</strong> to start a new game against the AI.</li>
              <li>Make your moves by dragging and dropping pieces on the board.</li>
            </ol>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-500/25"
          >
            Start Playing Now
          </Link>
        </div>
      </div>
    </div>
  )
}

function PieceCard({ name, desc }: { name: string, desc: string }) {
  return (
    <div className="p-4 bg-[#262421] rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
      <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  )
}
