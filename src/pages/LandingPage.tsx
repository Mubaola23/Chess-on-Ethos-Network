import { usePrivy } from '@privy-io/react-auth'
import {
  EthosLogo,
  LoginButton,
  TopLinks,
} from '../components.tsx'
import { Bot, ShieldCheck, History, Trophy, Cpu, Globe } from 'lucide-react'

export function LandingPage() {
  const { login } = usePrivy()

  return (
    <div className="min-h-screen bg-[#161512] text-white flex flex-col font-sans selection:bg-blue-500/30">
      {/* <TopLinks /> */}

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center gap-8 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 animate-fade-in">
          <div className="mb-8 inline-block p-4 bg-gray-800/30 rounded-3xl border border-gray-700/50 backdrop-blur-sm shadow-2xl">
            <EthosLogo size={120} />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
          CredChess - Credibility + Chess
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            The premier on-chain chess experience. Connect your identity, challenge sophisticated AI, and build your reputation.
          </p>

          <div className="flex flex-col items-center gap-4">
            <LoginButton onClick={login} />
            <p className="text-sm text-gray-500">Powered by Ethos & Privy</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-[#161512]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why CredChess?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We combine the classic game of kings with modern web3 identity and powerful game engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-green-400" />}
              title="Verified Identity"
              description="Log in seamlessly with your Ethos profile. Your reputation and score follow you across the ecosystem."
            />
            <FeatureCard
              icon={<Cpu className="w-8 h-8 text-blue-400" />}
              title="Advanced AI"
              description="Test your skills against our Stockfish-powered AI engine. Perfect your strategy in a focused environment."
            />
            <FeatureCard
              icon={<History className="w-8 h-8 text-orange-400" />}
              title="Game History"
              description="Every move matters. Track your wins, losses, and draws with detailed game logs and analytics."
            />
             <FeatureCard
              icon={<Trophy className="w-8 h-8 text-yellow-400" />}
              title="Earn Reputation"
              description="Build your credibility score as you play. Show off your status in the community."
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-purple-400" />}
              title="Web3 Native"
              description="Built for the decentralized web. Secure, transparent, and owned by the community."
            />
             <FeatureCard
              icon={<Bot className="w-8 h-8 text-red-400" />}
              title="Always Available"
              description="Play anytime, anywhere. Our responsive design works perfectly on desktop and mobile."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} CredChess. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-[#262421] border border-gray-800 hover:border-gray-700 transition-all hover:bg-[#2a2825] group">
      <div className="w-14 h-14 bg-gray-800/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
