import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '▤' },
  { to: '/discovery', label: 'ICP Discovery', icon: '⌕' },
  { to: '/prospects', label: 'Prospects', icon: '☲' },
  { to: '/campaigns', label: 'Campaigns', icon: '✦' },
  { to: '/signals', label: 'Signals', icon: '∿' },
  { to: '/agent', label: 'AI Agent', icon: '◈' },
  { to: '/pipeline', label: 'Pipeline', icon: '▦' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-green" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-accent-green animate-ping opacity-60" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight text-ink">Hakuna</h1>
        </div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted mt-2 font-medium">Outbound OS</p>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                isActive
                  ? 'bg-accent-green-soft text-accent-green font-semibold'
                  : 'text-slate-600 hover:text-ink hover:bg-subtle'
              }`
            }
          >
            <span className="w-4 text-center opacity-80">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-border bg-subtle/50">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium">Operator</div>
        <div className="text-sm mt-1 text-ink">workspace · <span className="text-muted">beta</span></div>
      </div>
    </aside>
  )
}
