const STAGES = ['Matched', 'Contacted', 'Opened', 'Replied', 'Booked', 'Closed']
const STAGE_COLOR = ['bg-slate-300', 'bg-accent-blue', 'bg-accent-blue', 'bg-accent-green', 'bg-accent-green', 'bg-purple-500']

function prospectStage(p) {
  if (p.status === 'qualified') return 5
  if (p.status === 'replied') return 3
  if (p.status === 'enrolled') return 1
  if (p.status === 'warm') return 2
  return 0
}

export default function PipelineView({ prospects }) {
  const counts = STAGES.map((_, i) => prospects.filter((p) => prospectStage(p) >= i).length)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-6 gap-3">
        {STAGES.map((s, i) => (
          <div key={s} className="bg-surface border border-border rounded-xl p-4 shadow-card">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">{s}</div>
            <div className="font-display text-3xl font-bold mt-2 text-ink">{counts[i]}</div>
            <div className={`h-1 mt-3 rounded-full ${STAGE_COLOR[i]}`} />
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
        <div className="font-display text-lg font-semibold mb-5 text-ink">Prospect journeys</div>
        <div className="space-y-5">
          {prospects.slice(0, 12).map((p) => {
            const current = prospectStage(p)
            const initials = `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`
            return (
              <div key={p.id || p.apollo_id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-accent-green flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {initials}
                </div>
                <div className="w-56 min-w-[180px]">
                  <div className="text-sm font-medium text-ink">{p.first_name} {p.last_name}</div>
                  <div className="text-xs text-muted truncate">{p.company}</div>
                </div>
                <div className="flex-1 flex items-center">
                  {STAGES.map((_, i) => (
                    <div key={i} className="flex items-center flex-1 last:flex-none">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 font-semibold ${
                          i < current ? 'bg-accent-green border-accent-green text-white' :
                          i === current ? 'border-accent-green text-accent-green bg-accent-green-soft animate-pulse' :
                          'border-slate-200 text-muted bg-white'
                        }`}
                      >
                        {i < current ? '✓' : i + 1}
                      </div>
                      {i < STAGES.length - 1 && (
                        <div className={`h-px flex-1 ${i < current ? 'bg-accent-green' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {prospects.length === 0 && (
            <div className="text-muted text-sm text-center py-10">No prospects in pipeline yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
