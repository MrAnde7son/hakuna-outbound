import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Discovery from './pages/Discovery.jsx'
import Prospects from './pages/Prospects.jsx'
import Campaigns from './pages/Campaigns.jsx'
import Signals from './pages/Signals.jsx'
import Agent from './pages/Agent.jsx'
import Pipeline from './pages/Pipeline.jsx'

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/prospects" element={<Prospects />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/signals" element={<Signals />} />
          <Route path="/agent" element={<Agent />} />
          <Route path="/pipeline" element={<Pipeline />} />
        </Routes>
      </main>
    </div>
  )
}
