import { Link, useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { EthosLogo, LogoutButton } from '../components.tsx'
import { LayoutDashboard, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useEthosWallet } from '../hooks'

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout, authenticated } = usePrivy()
  const navigate = useNavigate()
  const ethosWallet = useEthosWallet()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!authenticated || !ethosWallet) return

    const fetchPending = async () => {
      try {
        const res = await fetch(`/api/invitations/${ethosWallet}`)
        const data = await res.json()
        setPendingCount(data.received?.length || 0)
      } catch (err) {
        console.error('Failed to fetch pending invitations:', err)
      }
    }

    fetchPending()
    const interval = setInterval(fetchPending, 10000)
    return () => clearInterval(interval)
  }, [authenticated, ethosWallet])

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
            <span className="font-bold text-xl tracking-tight">Ethos Chess</span>
          </Link>

          <div className="flex items-center gap-6 text-gray-400 font-medium">
            <Link to="/" className="flex items-center gap-2 hover:text-white transition-colors">
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link to="/invitations" className="flex items-center gap-2 hover:text-white transition-colors relative">
              <Mail size={20} />
              Invitations
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
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
