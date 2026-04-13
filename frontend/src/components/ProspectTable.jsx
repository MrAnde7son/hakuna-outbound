import ScoreBar from './ScoreBar.jsx'
import { useAppStore } from '../store/useAppStore.js'

const STATUS_STYLE = {
  new: 'bg-slate-100 text-slate-600 border-slate-200',
  warm: 'bg-accent-blue-soft text-accent-blue border-blue-200',
  enrolled: 'bg-accent-green-soft text-accent-green border-emerald-200',
  replied: 'bg-amber-50 text-amber-700 border-amber-200',
  qualified: 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function ProspectTable({ rows, selectable = false, compact = false }) {
  const { selectedProspectIds, toggleSelect } = useAppStore()
  return (
    <div className="w-full overflow-auto border border-border rounded-xl bg-surface shadow-card">
      <table className="w-full text-sm">
        <thead className="bg-subtle border-b border-border">
          <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">
            {selectable && <th className="px-4 py-3 w-10"></th>}
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Company</th>
            {!compact && <th className="px-4 py-3">Industry</th>}
            <th className="px-4 py-3">ICP Score</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const id = p.id ?? p.apollo_id
            const checked = selectedProspectIds.has(id)
            return (
              <tr key={id} className="border-b border-border last:border-0 hover:bg-subtle/60 transition-colors">
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(id)}
                      className="accent-accent-green w-4 h-4 rounded"
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{p.first_name} {p.last_name}</div>
                  {!compact && <div className="text-xs text-muted">{p.email || '—'}</div>}
                </td>
                <td className="px-4 py-3 text-slate-600">{p.title}</td>
                <td className="px-4 py-3 text-ink">{p.company}</td>
                {!compact && <td className="px-4 py-3 text-slate-600">{p.industry || '—'}</td>}
                <td className="px-4 py-3"><ScoreBar score={Math.round(p.icp_score)} /></td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 border rounded-md ${STATUS_STYLE[p.status] || STATUS_STYLE.new}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr><td colSpan={selectable ? 7 : 6} className="px-4 py-12 text-center text-muted text-sm">No prospects yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
