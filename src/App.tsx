import { usePrivy } from '@privy-io/react-auth'
import { Routes, Route, Navigate } from 'react-router-dom'
import {
  EthosLogo,
  LoadingMessage,
  LoginButton,
  TopLinks,
} from './components.tsx'
import { Layout } from './components/Layout.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { GamePage } from './pages/GamePage.tsx'

export function App() {
  const { ready, authenticated } = usePrivy()

  if (!ready) {
    return <LoadingMessage />
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={!authenticated ? <NotAuthenticated /> : <Dashboard />}
        />
        <Route
          path="/game/:gameId"
          element={authenticated ? <GamePage /> : <Navigate to="/" />}
        />
      </Routes>
    </Layout>
  )
}

function NotAuthenticated() {
  const { login } = usePrivy()

  return (
    <>
      <TopLinks />
      <div className='landing-container'>
        <EthosLogo size={160} />

        <header className='app-header'>
          <h1 className="text-5xl font-extrabold mb-4">Ethos Chess</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            A fully functional on-chain chess application on the Ethos blockchain.
          </p>
        </header>

        <LoginButton onClick={login} />
      </div>
    </>
  )
}
