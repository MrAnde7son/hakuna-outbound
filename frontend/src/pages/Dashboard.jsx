import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client.js'
import StatCard from '../components/StatCard.jsx'
import ProspectTable from '../components/ProspectTable.jsx'
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Live operator view of your outbound motion.</p>
        </div>
        <div className="text-xs text-muted flex items-center gap-2 font-mono shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Prospects in pipeline" value={p.length} delta="+ today" />
        <StatCard label="Emails sent" value={totalSent.toLocaleString()} tone="blue" delta="7-day rolling" />
        <StatCard label="Open rate" value={`${avgOpen}%`} tone="blue" delta="across active sequences" />
        <StatCard label="Replies / booked" value={`${totalReplies} / ${totalBooked}`} delta="this cycle" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-3">
          <SectionTitle>Signal feed</SectionTitle>
          <SignalFeed signals={s} limit={4} />
        </section>
        <section className="space-y-3">
          <SectionTitle>Top prospects</SectionTitle>
          <ProspectTable rows={[...p].sort((a,b)=>b.icp_score-a.icp_score).slice(0, 4)} compact />
        </section>
      </div>

      <section className="space-y-3">
        <SectionTitle>Active campaigns</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {c.filter(x => x.status === 'active').slice(0, 4).map((x) => (
            <CampaignCard key={x.id} campaign={x} />
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionTitle({ children }) {
  return <div className="text-[11px] uppercase tracking-[0.22em] text-muted font-semibold">{children}</div>
}
