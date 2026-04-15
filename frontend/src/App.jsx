import { useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { NavBar, MobileTopBar, LogoWordmark, LogoSymbol, useBreakpoint } from '@hakunahq/ui'
import Dashboard from './pages/Dashboard.jsx'
import Discovery from './pages/Discovery.jsx'
import Prospects from './pages/Prospects.jsx'
import Campaigns from './pages/Campaigns.jsx'
import Signals from './pages/Signals.jsx'
import Agent from './pages/Agent.jsx'
import Pipeline from './pages/Pipeline.jsx'

// Keys mirror the first path segment (`/dashboard`, `/discovery`, …)
const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: icon('▤') },
  { key: 'discovery', label: 'ICP Discovery', path: '/discovery', icon: icon('⌕') },
  { key: 'prospects', label: 'Prospects',  path: '/prospects', icon: icon('☲') },
  { key: 'campaigns', label: 'Campaigns',  path: '/campaigns', icon: icon('✦') },
  { key: 'signals',   label: 'Signals',    path: '/signals',   icon: icon('∿') },
  { key: 'agent',     label: 'AI Agent',   path: '/agent',     icon: icon('◈') },
  { key: 'pipeline',  label: 'Pipeline',   path: '/pipeline',  icon: icon('▦') },
]

const ROUTE_TITLES = Object.fromEntries(NAV_ITEMS.map(i => [i.path, i.label]))

// The DS NavBar expects an `icon` ComponentType. We wrap unicode glyphs so
// we don't have to pull in lucide-react just for the sidebar.
function icon(glyph) {
  return function GlyphIcon({ size = 18, color }) {
    return (
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: size, height: size, fontSize: size - 2, lineHeight: 1,
          color: color || 'currentColor', opacity: 0.85,
        }}
      >
        {glyph}
      </span>
    )
  }
}

export default function App() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const bp = useBreakpoint()
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeKey = NAV_ITEMS.find(i => pathname.startsWith(i.path))?.key
  const title = ROUTE_TITLES[pathname] || 'Hakuna'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {!bp.md && (
        <MobileTopBar
          logo={<LogoWordmark size={20} />}
          onMenuClick={() => setMobileOpen(true)}
          actions={<span className="text-xs text-muted font-mono">{title}</span>}
        />
      )}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <NavBar
          items={NAV_ITEMS}
          activeKey={activeKey}
          onNavigate={(item) => navigate(item.path)}
          logo={<LogoWordmark size={22} />}
          logoCollapsed={<LogoSymbol size={20} />}
          subtitle="Outbound OS"
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
          footer={
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">Operator</div>
              <div className="text-xs mt-1">workspace · <span className="text-muted">beta</span></div>
            </div>
          }
        />
        <main
          style={{
            flex: 1, minWidth: 0, overflowY: 'auto',
            marginLeft: bp.md ? 220 : 0,
            background: 'var(--hk-bg)',
          }}
        >
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
