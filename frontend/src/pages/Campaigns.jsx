import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client.js'
import CampaignCard from '../components/CampaignCard.jsx'

export default function Campaigns() {
  const { data: campaigns = [], isLoading, isError, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/api/campaigns').then((r) => r.data.campaigns),
  })

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Campaigns</h1>
        <p className="text-muted text-sm mt-1">Your Lemlist sequences — live stats and controls.</p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 shadow-card animate-pulse h-40" />
          ))}
        </div>
      ) : isError ? (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-5">
          <div className="font-semibold">Couldn't load campaigns</div>
          <div className="text-sm mt-1">{error?.response?.data?.detail || error?.message || 'Unknown error'}</div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="border border-border bg-surface rounded-xl p-10 text-center">
          <div className="font-display text-lg font-semibold text-ink">No campaigns yet</div>
          <p className="text-muted text-sm mt-1">Create a sequence in Lemlist and it'll show up here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
        </div>
      )}
    </div>
  )
}
