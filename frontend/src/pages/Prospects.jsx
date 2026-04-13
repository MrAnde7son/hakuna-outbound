import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client.js'
import ProspectTable from '../components/ProspectTable.jsx'
import { useAppStore } from '../store/useAppStore.js'

export default function Prospects() {
  const qc = useQueryClient()
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prospects'] })
      clearSelection()
      setModalOpen(false)
    },
  })

  const count = selectedProspectIds.size

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto pb-24 sm:pb-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Prospects</h1>
        <p className="text-muted text-sm mt-1">Your working list. Select and enroll into Lemlist sequences.</p>
      </div>

      <ProspectTable rows={prospects} selectable />

      {count > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bg-surface border border-border-strong rounded-full px-4 sm:px-6 py-3 flex items-center justify-center gap-3 sm:gap-4 shadow-pop z-40">
          <span className="text-sm text-ink whitespace-nowrap"><span className="text-accent-green font-bold">{count}</span> selected</span>
          <button onClick={() => setModalOpen(true)} className="text-xs px-4 py-1.5 bg-accent-green text-white font-medium rounded-md hover:bg-emerald-600 transition shadow-sm whitespace-nowrap">Enroll<span className="hidden sm:inline"> in Lemlist</span></button>
          <button onClick={clearSelection} className="text-xs text-muted hover:text-ink transition">Clear</button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 w-full max-w-[480px] shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-xl font-semibold text-ink">Pick a campaign</div>
            <div className="text-xs text-muted mt-1">Enrolling {count} prospect{count !== 1 ? 's' : ''}.</div>
            <div className="mt-5 space-y-2 max-h-[400px] overflow-auto">
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => enroll.mutate(c.id)}
                  disabled={enroll.isPending}
                  className="w-full text-left border border-border rounded-lg px-4 py-3 hover:border-accent-green hover:bg-accent-green-soft/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-ink">{c.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">{c.status}</div>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {c.stats?.sent ?? 0} sent · {c.stats?.openRate ?? 0}% open · {c.stats?.replyRate ?? 0}% reply
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setModalOpen(false)} className="mt-5 text-xs text-muted hover:text-ink transition">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
