import { Link, useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { EthosLogo, LogoutButton } from '../components.tsx'
import { LayoutDashboard, Mail } from 'lucide-react'

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
            <span className="font-bold text-xl tracking-tight">Ethos Chess</span>
          </Link>

          <div className="flex items-center gap-6 text-gray-400 font-medium">
            <Link to="/" className="flex items-center gap-2 hover:text-white transition-colors">
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link to="/invitations" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={20} />
              Invitations
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
