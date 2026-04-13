import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client.js'
import SignalFeed from '../components/SignalFeed.jsx'

export default function Signals() {
  const { data: signals = [] } = useQuery({
    queryKey: ['signals'],
    queryFn: () => api.get('/api/signals').then((r) => r.data.signals),
    refetchInterval: 30_000,
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Signals</h1>
          <p className="text-muted text-sm mt-1">Live engagement across every Lemlist sequence.</p>
        </div>
        <div className="text-xs text-muted flex items-center gap-2 font-mono shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="hidden sm:inline">Auto-refresh · </span>30s
        </div>
      </div>
      <SignalFeed signals={signals} onRespond={(s) => alert(`Open draft reply to ${s.prospect}`)} />
    </div>
  )
}
