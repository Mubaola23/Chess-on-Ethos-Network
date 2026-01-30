import { Link, useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { EthosLogo,type EthosUser, LogoutButton } from '../components.tsx'
import { LayoutDashboard, BookOpen } from 'lucide-react'
export function Layout({ children }: { children: React.ReactNode }) {
  const { logout, authenticated } = usePrivy()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!authenticated) return <>{children}</>

  return (
    <div className="min-h-screen bg-[#161512] text-white flex flex-col">
      <nav className="border-b border-gray-800 bg-[#262421] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <EthosLogo size={40} />
            <span className="font-bold text-xl tracking-tight">CredChess</span>
          </Link>

          <div className="flex items-center gap-6 text-gray-400 font-medium">
            <Link to="/" className="flex items-center gap-2 hover:text-white transition-colors">
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
             <Link to="/tutorial" className="flex items-center gap-2 hover:text-white transition-colors">
              <BookOpen size={20} />
              Tutorial
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LogoutButton onClick={handleLogout} />
        </div>
      </nav>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

// Score ranges from Ethos
const scoreRanges = {
  untrusted: { min: 0, max: 799 },
  questionable: { min: 800, max: 1199 },
  neutral: { min: 1200, max: 1399 },
  known: { min: 1400, max: 1599 },
  established: { min: 1600, max: 1799 },
  reputable: { min: 1800, max: 1999 },
  exemplary: { min: 2000, max: 2199 },
  distinguished: { min: 2200, max: 2399 },
  revered: { min: 2400, max: 2599 },
  renowned: { min: 2600, max: 2800 },
} as const


// Score colors (dark theme) from Ethos
const scoreLevelColors = {
  untrusted: '#b72b38',
  questionable: '#C29010',
  neutral: 'rgba(193, 192, 182, 1)',
  known: '#7C8DA8',
  established: '#4E86B9',
  reputable: '#2E7BC3',
  exemplary: '#427B56',
  distinguished: '#127f31',
  revered: '#836DA6',
  renowned: '#7A5EAF',
} as const


type ScoreLevel = keyof typeof scoreRanges

function getScoreLevel(score: number): ScoreLevel {
  for (const [level, range] of Object.entries(scoreRanges)) {
    if (score >= range.min && score <= range.max) {
      return level as ScoreLevel
    }
  }
  return score > 2800 ? 'renowned' : 'untrusted'
}

function getScoreColor(score: number): string {
  const level = getScoreLevel(score)
  return scoreLevelColors[level]
}

export function EthosProfileCard({ user }: { user: EthosUser }) {
  const scoreColor = getScoreColor(user.score)
  const scoreLevel = getScoreLevel(user.score)

  return (
    <div className='profile-card'>
      {user.avatarUrl && (
        <img src={user.avatarUrl} alt={user.displayName} className='profile-avatar' />
      )}
      <div className='profile-info'>
        <h2 className='profile-name'>
          {user.links?.profile
            ? (
              <a href={user.links.profile} target='_blank' rel='noopener noreferrer'>
                {user.displayName}
              </a>
            )
            : (
              user.displayName
            )}
          {user.username && <span className='profile-username'>@{user.username}</span>}
        </h2>
        {user.profileId && <p className='profile-id'>Profile ID: {user.profileId}</p>}
        {user.description && <p className='profile-description'>{user.description}</p>}
        <p className='profile-score'>
          Credibility Score: <strong style={{ color: scoreColor }}>{user.score}</strong>{' '}
          <span className='score-level' style={{ color: scoreColor }}>
            ({scoreLevel})
          </span>
        </p>
      </div>
    </div>
  )
}
