export default function ScoreBar({ score }) {
  const color = score >= 85 ? 'bg-accent-green' : score >= 70 ? 'bg-accent-blue' : 'bg-slate-300'
  const txt = score >= 85 ? 'text-accent-green' : score >= 70 ? 'text-accent-blue' : 'text-muted'
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} animate-fill rounded-full`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      <span className={`text-xs font-mono w-8 text-right font-semibold ${txt}`}>{score}</span>
    </div>
  )
}
