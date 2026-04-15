import { Card, Avatar, StatCard, ResponsiveGrid } from '@hakunahq/ui'

const STAGES = ['Matched', 'Contacted', 'Opened', 'Replied', 'Booked', 'Closed']
const STAGE_COLOR = [
  'var(--hk-neutral-300)',
  'var(--hk-primary)',
  'var(--hk-primary)',
  'var(--hk-success)',
  'var(--hk-success)',
  'var(--hk-purple)',
]

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
    <div className="space-y-6 lg:space-y-8">
      <ResponsiveGrid min={160} gap={12}>
        {STAGES.map((s, i) => (
          <StatCard key={s} label={s} value={counts[i]} color={STAGE_COLOR[i]} />
        ))}
      </ResponsiveGrid>

      <Card style={{ padding: 24 }}>
        <div className="font-display text-lg font-semibold mb-5">Prospect journeys</div>
        <div className="space-y-5">
          {prospects.slice(0, 12).map((p) => {
            const current = prospectStage(p)
            const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown'
            return (
              <div
                key={p.id || p.apollo_id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-3 sm:gap-4 sm:w-auto">
                  <Avatar name={name} size={36} />
                  <div className="min-w-0 sm:w-56 sm:min-w-[180px]">
                    <div className="text-sm font-medium truncate">{name}</div>
                    <div className="text-xs text-muted truncate">{p.company}</div>
                  </div>
                </div>
                <div className="flex-1 flex items-center overflow-x-auto sm:overflow-visible pl-[3.25rem] sm:pl-0 -mt-2 sm:mt-0">
                  {STAGES.map((_, i) => (
                    <div key={i} className="flex items-center flex-1 last:flex-none min-w-[28px]">
                      <StageDot done={i < current} current={i === current} index={i} />
                      {i < STAGES.length - 1 && (
                        <div
                          className="h-px flex-1 min-w-[12px]"
                          style={{
                            background: i < current ? 'var(--hk-success)' : 'var(--hk-border)',
                          }}
                        />
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
      </Card>
    </div>
  )
}

function StageDot({ done, current, index }) {
  return (
    <div
      className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-semibold"
      style={{
        background: done ? 'var(--hk-success)' : current ? 'var(--hk-success-subtle)' : 'var(--hk-card)',
        border: `2px solid ${done || current ? 'var(--hk-success)' : 'var(--hk-border)'}`,
        color: done ? 'var(--hk-on-bright)' : current ? 'var(--hk-success)' : 'var(--hk-text-muted)',
        animation: current ? 'hk-pulse-dot 1.6s ease-in-out infinite' : undefined,
      }}
    >
      {done ? '✓' : index + 1}
    </div>
  )
}
