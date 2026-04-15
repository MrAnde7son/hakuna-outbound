import { useQuery } from '@tanstack/react-query'
import { PageHeader, EmptyState, ErrorBanner, SkeletonCard, ResponsiveGrid } from '@hakunahq/ui'
import { api } from '../api/client.js'
import CampaignCard from '../components/CampaignCard.jsx'

export default function Campaigns() {
  const { data: campaigns = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/api/campaigns').then((r) => r.data.campaigns),
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Campaigns"
        subtitle="Your Lemlist sequences — live stats and controls."
      />
      {isLoading ? (
        <ResponsiveGrid min={320} gap={16}>
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} lines={4} />)}
        </ResponsiveGrid>
      ) : isError ? (
        <ErrorBanner error={error} onRetry={() => refetch()} />
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          sub="Create a sequence in Lemlist and it'll show up here."
        />
      ) : (
        <ResponsiveGrid min={320} gap={16}>
          {campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
        </ResponsiveGrid>
      )}
    </div>
  )
}
