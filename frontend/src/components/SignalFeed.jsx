const ICONS = {
  open: { glyph: '◉', color: 'text-accent-blue', bg: 'bg-accent-blue-soft' },
  click: { glyph: '↗', color: 'text-accent-blue', bg: 'bg-accent-blue-soft' },
  reply: { glyph: '✎', color: 'text-accent-green', bg: 'bg-accent-green-soft' },
  booked: { glyph: '★', color: 'text-amber-600', bg: 'bg-amber-50' },
}

function timeAgo(ts) {
  const d = new Date(ts)
  const secs = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000))
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export default function SignalFeed({ signals, onRespond, limit }) {
  const rows = limit ? signals.slice(0, limit) : signals
  return (
    <div className="border border-border rounded-xl divide-y divide-border bg-surface shadow-card overflow-hidden">
      {rows.map((s) => {
        const ic = ICONS[s.type] || ICONS.open
        const showCTA = s.type === 'reply' || s.type === 'booked'
        return (
          <div key={s.id} className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 hover:bg-subtle/60 transition-colors">
            <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${ic.bg} ${ic.color}`}>
              <span className="text-sm">{ic.glyph}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-ink">{s.title}</div>
              <div className="text-xs text-muted truncate">{s.subtext} · {s.campaign}</div>
              <div className="text-xs text-muted font-mono sm:hidden mt-1">{timeAgo(s.timestamp)}</div>
            </div>
            <div className="text-xs text-muted whitespace-nowrap font-mono hidden sm:block">{timeAgo(s.timestamp)}</div>
            {showCTA && (
              <button
                onClick={() => onRespond?.(s)}
                className="text-xs font-medium px-3 py-1.5 border border-emerald-200 bg-accent-green-soft text-accent-green rounded-md hover:bg-emerald-100 hover:border-emerald-300 transition shrink-0"
              >
                Respond
              </button>
            )}
          </div>
        )
      })}
      {rows.length === 0 && <div className="px-5 py-12 text-center text-muted text-sm">No signals yet.</div>}
    </div>
  )
}
