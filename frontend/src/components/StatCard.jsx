export default function StatCard({ label, value, delta, tone = 'green' }) {
  const toneClass = tone === 'green' ? 'text-accent-green' : tone === 'blue' ? 'text-accent-blue' : 'text-ink'
  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover hover:border-border-strong transition-all">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium">{label}</div>
      <div className={`font-display text-3xl font-bold mt-2 ${toneClass}`}>{value}</div>
      {delta && <div className="text-xs text-muted mt-2">{delta}</div>}
    </div>
  )
}
