import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@hakunahq/ui'
import { api } from '../api/client.js'
import PipelineView from '../components/PipelineView.jsx'

export default function Pipeline() {
  const { data: prospects = [] } = useQuery({
    queryKey: ['prospects'],
    queryFn: () => api.get('/api/prospects').then((r) => r.data.prospects),
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Pipeline"
        subtitle="Every prospect's journey from match to close."
      />
      <PipelineView prospects={prospects} />
    </div>
  )
}
