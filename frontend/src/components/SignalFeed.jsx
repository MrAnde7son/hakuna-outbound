import { Button } from '@hakunahq/ui'

const ICONS = {
  open:   { glyph: '◉', fg: 'var(--hk-primary)', bg: 'var(--hk-primary-50)' },
  click:  { glyph: '↗', fg: 'var(--hk-primary)', bg: 'var(--hk-primary-50)' },
  reply:  { glyph: '✎', fg: 'var(--hk-success)', bg: 'var(--hk-success-subtle)' },
  booked: { glyph: '★', fg: 'var(--hk-warning)', bg: 'var(--hk-warning-subtle)' },
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
    <div
      className="rounded-md overflow-hidden"
      style={{
        background: 'var(--hk-card)',
        border: '1px solid var(--hk-border)',
        boxShadow: 'var(--hk-shadow-sm)',
      }}
    >
      {rows.map((s, idx) => {
        const ic = ICONS[s.type] || ICONS.open
        const showCTA = s.type === 'reply' || s.type === 'booked'
        return (
          <div
            key={s.id}
            className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 transition-colors"
            style={{ borderTop: idx > 0 ? '1px solid var(--hk-border)' : 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hk-bg-muted)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div
              className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center"
              style={{ background: ic.bg, color: ic.fg }}
            >
              <span className="text-sm">{ic.glyph}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm">{s.title}</div>
              <div className="text-xs text-muted truncate">{s.subtext} · {s.campaign}</div>
              <div className="text-xs text-muted font-mono sm:hidden mt-1">{timeAgo(s.timestamp)}</div>
            </div>
            <div className="text-xs text-muted whitespace-nowrap font-mono hidden sm:block">
              {timeAgo(s.timestamp)}
            </div>
            {showCTA && (
              <Button size="sm" variant="success" onClick={() => onRespond?.(s)}>Respond</Button>
            )}
          </div>
        )
      })}
      {rows.length === 0 && (
        <div className="px-5 py-12 text-center text-muted text-sm">No signals yet.</div>
      )}
    </div>
  )
}
