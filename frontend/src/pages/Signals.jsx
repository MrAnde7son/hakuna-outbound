import { useQuery } from '@tanstack/react-query'
import { PageHeader, useToast } from '@hakunahq/ui'
import { api } from '../api/client.js'
import SignalFeed from '../components/SignalFeed.jsx'

export default function Signals() {
  const toast = useToast()
  const { data: signals = [] } = useQuery({
    queryKey: ['signals'],
    queryFn: () => api.get('/api/signals').then((r) => r.data.signals),
    refetchInterval: 30_000,
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Signals"
        subtitle="Live engagement across every Lemlist sequence."
        action={
          <div className="text-xs text-muted flex items-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="hidden sm:inline">Auto-refresh · </span>30s
          </div>
        }
      />
      <SignalFeed
        signals={signals}
        onRespond={(s) => toast.info(`Opening draft reply to ${s.prospect}`)}
      />
    </div>
  )
}
