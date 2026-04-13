import { useEffect, useRef } from 'react'
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
  const { selectedProspectIds, toggleSelect, selectAll, clearSelection } = useAppStore()
  const headerRef = useRef(null)
  const visibleIds = rows.map((p) => p.id ?? p.apollo_id)
  const selectedVisibleCount = visibleIds.filter((id) => selectedProspectIds.has(id)).length
  const allSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const someSelected = selectedVisibleCount > 0 && !allSelected

  useEffect(() => {
    if (headerRef.current) headerRef.current.indeterminate = someSelected
  }, [someSelected])

  const toggleAll = () => {
    if (allSelected) clearSelection()
    else selectAll(visibleIds)
  }

  return (
    <div className="w-full border border-border rounded-xl bg-surface shadow-card overflow-hidden">
      {/* Mobile card view */}
      <div className="sm:hidden divide-y divide-border">
        {rows.map((p) => {
          const id = p.id ?? p.apollo_id
          const checked = selectedProspectIds.has(id)
          return (
            <div key={id} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {selectable && (
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(id)}
                      className="accent-accent-green w-4 h-4 rounded mt-1 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium text-ink text-sm truncate">{p.first_name} {p.last_name}</div>
                    <div className="text-xs text-muted truncate">{p.title}</div>
                    <div className="text-xs text-slate-600 truncate mt-0.5">{p.company}{p.industry ? ` · ${p.industry}` : ''}</div>
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 border rounded-md shrink-0 ${STATUS_STYLE[p.status] || STATUS_STYLE.new}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted font-semibold shrink-0">ICP</span>
                <ScoreBar score={Math.round(p.icp_score)} />
              </div>
            </div>
          )
        })}
        {rows.length === 0 && (
          <div className="px-4 py-12 text-center text-muted text-sm">No prospects yet.</div>
        )}
      </div>

      {/* Desktop / tablet table view */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-subtle border-b border-border">
            <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    ref={headerRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all prospects"
                    className="accent-accent-green w-4 h-4 rounded"
                  />
                </th>
              )}
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Company</th>
              {!compact && <th className="px-4 py-3 hidden lg:table-cell">Industry</th>}
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
                  {!compact && <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{p.industry || '—'}</td>}
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
    </div>
  )
}
