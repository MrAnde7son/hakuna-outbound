import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client.js'
import PipelineView from '../components/PipelineView.jsx'

export default function Pipeline() {
  const { data: prospects = [] } = useQuery({
    queryKey: ['prospects'],
    queryFn: () => api.get('/api/prospects').then((r) => r.data.prospects),
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Pipeline</h1>
        <p className="text-muted text-sm mt-1">Every prospect's journey from match to close.</p>
      </div>
      <PipelineView prospects={prospects} />
    </div>
  )
}
