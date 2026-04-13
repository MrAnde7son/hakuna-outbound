import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Discovery from './pages/Discovery.jsx'
import Prospects from './pages/Prospects.jsx'
import Campaigns from './pages/Campaigns.jsx'
import Signals from './pages/Signals.jsx'
import Agent from './pages/Agent.jsx'
import Pipeline from './pages/Pipeline.jsx'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileTopBar onMenu={() => setSidebarOpen(true)} />
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
    </div>
  )
}

const ROUTE_TITLES = {
  '/dashboard': 'Dashboard',
  '/discovery': 'ICP Discovery',
  '/prospects': 'Prospects',
  '/campaigns': 'Campaigns',
  '/signals': 'Signals',
  '/agent': 'AI Agent',
  '/pipeline': 'Pipeline',
}

function MobileTopBar({ onMenu }) {
  const { pathname } = useLocation()
  const title = ROUTE_TITLES[pathname] || 'Hakuna'
  return (
    <header className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-surface shrink-0">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="w-9 h-9 flex flex-col items-center justify-center gap-[4px] rounded-md border border-border hover:bg-subtle transition"
      >
        <span className="w-4 h-[2px] bg-ink rounded-full" />
        <span className="w-4 h-[2px] bg-ink rounded-full" />
        <span className="w-4 h-[2px] bg-ink rounded-full" />
      </button>
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-accent-green" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-accent-green animate-ping opacity-60" />
        </div>
        <div className="font-display text-base font-bold tracking-tight text-ink">Hakuna</div>
        <span className="text-muted text-sm">·</span>
        <div className="text-sm text-slate-600">{title}</div>
      </div>
    </header>
  )
}
