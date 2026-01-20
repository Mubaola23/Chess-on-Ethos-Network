import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EthosProvider } from './providers/EthosProvider';
import Dashboard from './pages/Dashboard';
import InvitationsPage from './pages/InvitationsPage';
import GamePage from './pages/GamePage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <EthosProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Toaster position="top-right" />
          <main className="py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/invitations" element={<InvitationsPage />} />
              <Route path="/game/:id" element={<GamePage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </EthosProvider>
  );
}

export default App;
