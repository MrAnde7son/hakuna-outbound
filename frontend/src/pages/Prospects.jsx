import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, Modal, Button, useToast } from '@hakunahq/ui'
import { api } from '../api/client.js'
import ProspectTable from '../components/ProspectTable.jsx'
import { useAppStore } from '../store/useAppStore.js'

export default function Prospects() {
  const qc = useQueryClient()
  const toast = useToast()
  const { selectedProspectIds, clearSelection } = useAppStore()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: prospects = [] } = useQuery({
    queryKey: ['prospects'],
    queryFn: () => api.get('/api/prospects').then((r) => r.data.prospects),
  })
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/api/campaigns').then((r) => r.data.campaigns),
  })

  const enroll = useMutation({
    mutationFn: async (campaign_id) => {
      const { data } = await api.post('/api/prospects/enroll', {
        prospect_ids: Array.from(selectedProspectIds),
        campaign_id,
      })
      return data
    },
    onSuccess: (_data, campaign_id) => {
      qc.invalidateQueries({ queryKey: ['prospects'] })
      const name = campaigns.find(c => c.id === campaign_id)?.name || 'campaign'
      toast.success(`Enrolled ${selectedProspectIds.size} into ${name}`)
      clearSelection()
      setModalOpen(false)
    },
    onError: (err) => {
      toast.error(err?.response?.data?.detail || 'Enrollment failed')
    },
  })

  const count = selectedProspectIds.size

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto pb-24 sm:pb-6">
      <PageHeader
        title="Prospects"
        subtitle="Your working list. Select and enroll into Lemlist sequences."
      />

      <ProspectTable rows={prospects} selectable />

      {count > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bg-surface border border-border-strong rounded-full px-4 sm:px-6 py-3 flex items-center justify-center gap-3 sm:gap-4 shadow-pop z-40">
          <span className="text-sm whitespace-nowrap">
            <span className="text-accent-green font-bold">{count}</span> selected
          </span>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            Enroll<span className="hidden sm:inline"> in Lemlist</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Pick a campaign"
        size="sm"
      >
        <div className="text-xs text-muted">
          Enrolling {count} prospect{count !== 1 ? 's' : ''}.
        </div>
        <div className="mt-4 space-y-2 max-h-[400px] overflow-auto">
          {campaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => enroll.mutate(c.id)}
              disabled={enroll.isPending}
              className="w-full text-left border border-border rounded-md px-4 py-3 hover:border-accent-green hover:bg-accent-green-soft/50 transition disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">{c.status}</div>
              </div>
              <div className="text-xs text-muted mt-1">
                {c.stats?.sent ?? 0} sent · {c.stats?.openRate ?? 0}% open · {c.stats?.replyRate ?? 0}% reply
              </div>
            </button>
          ))}
          {campaigns.length === 0 && (
            <div className="text-muted text-sm text-center py-6">No campaigns available.</div>
          )}
        </div>
      </Modal>
    </div>
  )
}
