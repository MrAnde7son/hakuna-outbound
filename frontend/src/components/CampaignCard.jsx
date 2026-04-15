import { Card, StatusBadge, ProgressBar, Button } from '@hakunahq/ui'

export default function CampaignCard({ campaign, onPause, onResume, onLaunch, onView }) {
  const s = campaign.stats || {}
  const openPct = s.openRate || 0

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-lg font-semibold truncate">{campaign.name}</div>
          <div className="text-xs text-muted mt-1 font-mono truncate">ID · {campaign.id}</div>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Sent"   value={s.sent ?? 0} />
        <Metric label="Open"   value={fmtPct(s.openRate)}  color="var(--hk-primary)" />
        <Metric label="Reply"  value={fmtPct(s.replyRate)} color="var(--hk-success)" />
        <Metric label="Booked" value={s.booked ?? 0}        color="var(--hk-success)" />
      </div>

      <ProgressBar
        label="Sequence progress"
        value={openPct}
        max={100}
        color="var(--hk-primary)"
      />

      <div className="flex flex-wrap gap-2">
        {campaign.status === 'active' && (
          <Button size="sm" variant="ghost" onClick={() => onPause?.(campaign)}>Pause</Button>
        )}
        {campaign.status === 'paused' && (
          <Button size="sm" variant="success" onClick={() => onResume?.(campaign)}>Resume</Button>
        )}
        {campaign.status === 'draft' && (
          <Button size="sm" variant="primary" onClick={() => onLaunch?.(campaign)}>Launch</Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => onView?.(campaign)}>View</Button>
      </div>
    </Card>
  )
}

function fmtPct(v) {
  if (v == null) return '0%'
  const n = typeof v === 'number' ? v : Number(v)
  return `${Number.isFinite(n) ? n.toFixed(1) : 0}%`
}

function Metric({ label, value, color }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</div>
      <div
        className="font-display text-xl font-bold mt-1"
        style={{ color: color || 'var(--hk-text)' }}
      >
        {value}
      </div>
    </div>
  )
}
