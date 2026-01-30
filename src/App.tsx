import { usePrivy } from '@privy-io/react-auth'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoadingMessage } from './components.tsx'
import { Layout } from './components/Layout.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { GamePage } from './pages/GamePage.tsx'
import { LandingPage } from './pages/LandingPage.tsx'
import { useEthosUser, useEthosWallet } from './hooks.ts'

export function App() {
  const { ready, authenticated } = usePrivy()
   const ethosWallet = useEthosWallet()
  const { ethosUser} = useEthosUser(ethosWallet)

  if (!ready) {
    return <LoadingMessage />
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={!authenticated  || ethosUser==null? <LandingPage /> : <Dashboard user={ethosUser} />}
        />
        <Route
          path="/game/:gameId"
          element={authenticated ? <GamePage /> : <Navigate to="/" />}
        />
      </Routes>
    </Layout>
  )
}
