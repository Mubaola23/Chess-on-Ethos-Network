import { usePrivy } from '@privy-io/react-auth'
import {
  EthosLogo,
  LoginButton,
  TopLinks,
} from '../components.tsx'

export function LandingPage() {
  const { login } = usePrivy()

  return (
    <div className="min-h-screen flex flex-col relative bg-[#161512] text-white">
      <TopLinks />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
        <EthosLogo size={160} />

        <header className="space-y-4">
          <h1 className="text-5xl font-extrabold">Ethos Chess</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A fully functional on-chain chess application on the Ethos blockchain.
          </p>
        </header>

        <LoginButton onClick={login} />
      </div>
    </div>
  )
}
