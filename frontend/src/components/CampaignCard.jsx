const STATUS_STYLE = {
  active: 'bg-accent-green-soft text-accent-green border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function CampaignCard({ campaign, onPause, onResume, onLaunch }) {
  const s = campaign.stats || {}
  const openPct = s.openRate || 0
  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover hover:border-border-strong transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg font-semibold text-ink">{campaign.name}</div>
          <div className="text-xs text-muted mt-1 font-mono">ID · {campaign.id}</div>
        </div>
        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 border rounded-md ${STATUS_STYLE[campaign.status] || STATUS_STYLE.draft}`}>
          {campaign.status}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-5">
        <Metric label="Sent" value={s.sent ?? 0} />
        <Metric label="Open" value={`${(s.openRate ?? 0).toFixed ? s.openRate.toFixed(1) : s.openRate}%`} tone="blue" />
        <Metric label="Reply" value={`${(s.replyRate ?? 0).toFixed ? s.replyRate.toFixed(1) : s.replyRate}%`} tone="green" />
        <Metric label="Booked" value={s.booked ?? 0} tone="green" />
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted mb-2 font-semibold">
          <span>Sequence progress</span><span>{Math.round(openPct)}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent-blue to-accent-green animate-fill rounded-full" style={{ width: `${openPct}%` }} />
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        {campaign.status === 'active' && (
          <button onClick={() => onPause?.(campaign)} className="text-xs font-medium px-3 py-2 border border-border rounded-md hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition">Pause</button>
        )}
        {campaign.status === 'paused' && (
          <button onClick={() => onResume?.(campaign)} className="text-xs font-medium px-3 py-2 border border-border rounded-md hover:border-emerald-300 hover:bg-accent-green-soft hover:text-accent-green transition">Resume</button>
        )}
        {campaign.status === 'draft' && (
          <button onClick={() => onLaunch?.(campaign)} className="text-xs px-3 py-2 bg-accent-green text-white font-medium rounded-md hover:bg-emerald-600 transition shadow-sm">Launch</button>
        )}
        <button className="text-xs font-medium px-3 py-2 border border-border rounded-md hover:border-border-strong hover:bg-subtle transition text-slate-600">View</button>
      </div>
    </div>
  )
}

function Metric({ label, value, tone }) {
  const toneClass = tone === 'green' ? 'text-accent-green' : tone === 'blue' ? 'text-accent-blue' : 'text-ink'
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</div>
      <div className={`font-display text-xl font-bold mt-1 ${toneClass}`}>{value}</div>
    </div>
  )
}
