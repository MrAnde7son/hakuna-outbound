import { useQuery } from '@tanstack/react-query'
import { PageHeader, ResponsiveGrid, StatCard, StatusBadge } from '@hakunahq/ui'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import SignalFeed from '../components/SignalFeed.jsx'
import CampaignCard from '../components/CampaignCard.jsx'

export default function Dashboard() {
  const prospects = useQuery({ queryKey: ['prospects'], queryFn: () => api.get('/api/prospects').then(r => r.data.prospects) })
  const campaigns = useQuery({ queryKey: ['campaigns'], queryFn: () => api.get('/api/campaigns').then(r => r.data.campaigns) })
  const signals = useQuery({ queryKey: ['signals'], queryFn: () => api.get('/api/signals').then(r => r.data.signals), refetchInterval: 30_000 })

  const p = prospects.data || []
  const c = campaigns.data || []
  const s = signals.data || []
  const totalSent = c.reduce((a, x) => a + (x.stats?.sent || 0), 0)
  const avgOpen = c.length ? (c.reduce((a, x) => a + (x.stats?.openRate || 0), 0) / c.length).toFixed(1) : 0
  const totalReplies = c.reduce((a, x) => a + (x.stats?.replies || 0), 0)
  const totalBooked = c.reduce((a, x) => a + (x.stats?.booked || 0), 0)
  const topProspects = [...p].sort((a, b) => (b.icp_score || 0) - (a.icp_score || 0)).slice(0, 5)
  const activeCampaigns = c.filter(x => x.status === 'active').slice(0, 4)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle="Live operator view of your outbound motion."
        action={
          <div className="text-xs text-muted flex items-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            Live
          </div>
        }
      />

      <ResponsiveGrid min={200} gap={12}>
        <StatCard label="Prospects in pipeline" value={p.length} sub="+ today" color="var(--hk-success)" />
        <StatCard label="Emails sent" value={totalSent.toLocaleString()} sub="7-day rolling" color="var(--hk-primary)" />
        <StatCard label="Open rate" value={`${avgOpen}%`} sub="across active sequences" color="var(--hk-primary)" />
        <StatCard label="Replies / booked" value={`${totalReplies} / ${totalBooked}`} sub="this cycle" color="var(--hk-success)" />
      </ResponsiveGrid>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 space-y-3 min-w-0">
          <SectionHeader title="Signal feed" link={{ to: '/signals', label: 'View all' }} />
          {s.length === 0 ? (
            <EmptyState
              title="No signals yet"
              body="Opens, clicks, and replies will stream in here as your sequences run."
            />
          ) : (
            <SignalFeed signals={s} limit={5} />
          )}
        </section>
        <section className="lg:col-span-2 space-y-3 min-w-0">
          <SectionHeader title="Top prospects" link={{ to: '/prospects', label: 'View all' }} />
          <TopProspectsList rows={topProspects} />
        </section>
      </div>

      <section className="space-y-3">
        <SectionHeader
          title="Active campaigns"
          meta={`${activeCampaigns.length} running`}
          link={{ to: '/campaigns', label: 'View all' }}
        />
        {activeCampaigns.length === 0 ? (
          <EmptyState
            title="No active campaigns"
            body="Launch a campaign to start reaching out to your prospects."
            cta={{ to: '/campaigns', label: 'Go to campaigns' }}
          />
        ) : (
          <ResponsiveGrid min={320} gap={16}>
            {activeCampaigns.map((x) => (
              <CampaignCard key={x.id} campaign={x} />
            ))}
          </ResponsiveGrid>
        )}
      </section>
    </div>
  )
}

function SectionHeader({ title, meta, link }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-baseline gap-3">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted font-semibold">{title}</div>
        {meta && <div className="text-xs text-muted font-mono">{meta}</div>}
      </div>
      {link && (
        <Link
          to={link.to}
          className="text-xs text-muted hover:text-[var(--hk-primary)] transition-colors font-medium"
        >
          {link.label} →
        </Link>
      )}
    </div>
  )
}

function TopProspectsList({ rows }) {
  if (rows.length === 0) {
    return <EmptyState title="No prospects yet" body="Discover and enrich prospects to see them here." compact />
  }
  return (
    <div
      className="rounded-md overflow-hidden"
      style={{
        background: 'var(--hk-card)',
        border: '1px solid var(--hk-border)',
        boxShadow: 'var(--hk-shadow-sm)',
      }}
    >
      {rows.map((p, idx) => {
        const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || '—'
        const initials = (p.first_name?.[0] || '') + (p.last_name?.[0] || '')
        const score = Math.round(p.icp_score || 0)
        const scoreColor = score >= 90 ? 'var(--hk-success)' : score >= 75 ? 'var(--hk-primary)' : 'var(--hk-text-muted)'
        return (
          <div
            key={p.id ?? p.apollo_id}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderTop: idx > 0 ? '1px solid var(--hk-border)' : 'none' }}
          >
            <div
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: 'var(--hk-primary-50)', color: 'var(--hk-primary-700)' }}
            >
              {initials.toUpperCase() || '·'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{name}</div>
              <div className="text-xs text-muted truncate">
                {p.title || '—'}{p.company ? ` · ${p.company}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="font-mono text-sm font-semibold tabular-nums"
                style={{ color: scoreColor }}
              >
                {score}
              </div>
              {p.status && <StatusBadge status={p.status} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EmptyState({ title, body, cta, compact = false }) {
  return (
    <div
      className={`rounded-md text-center ${compact ? 'px-4 py-8' : 'px-6 py-12'}`}
      style={{
        background: 'var(--hk-card)',
        border: '1px dashed var(--hk-border)',
      }}
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted mt-1 max-w-sm mx-auto">{body}</div>
      {cta && (
        <Link
          to={cta.to}
          className="inline-block mt-3 text-xs font-medium"
          style={{ color: 'var(--hk-primary)' }}
        >
          {cta.label} →
        </Link>
      )}
    </div>
  )
}
