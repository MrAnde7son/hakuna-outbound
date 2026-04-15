import { Table, Checkbox, StatusBadge, ScoreBar } from '@hakunahq/ui'
import { useAppStore } from '../store/useAppStore.js'

// Outbound-specific statuses the DS doesn't ship by default.
// The DS StatusBadge accepts a `styles` override that is merged
// over the built-ins — we extend it with our pipeline states.
const PROSPECT_STATUS_STYLES = {
  new:       { bg: 'var(--hk-neutral-100)',     text: 'var(--hk-neutral-600)',      dot: 'var(--hk-neutral-400)' },
  warm:      { bg: 'var(--hk-primary-50)',       text: 'var(--hk-primary-700)',      dot: 'var(--hk-primary-500)' },
  enrolled:  { bg: 'var(--hk-success-subtle)',   text: 'var(--hk-success-on-subtle)', dot: 'var(--hk-success)' },
  replied:   { bg: 'var(--hk-warning-subtle)',   text: 'var(--hk-warning-on-subtle)', dot: 'var(--hk-warning)' },
  qualified: { bg: 'var(--hk-purple-subtle)',    text: 'var(--hk-purple-on-subtle)',  dot: 'var(--hk-purple)' },
}

export default function ProspectTable({ rows, selectable = false, compact = false }) {
  const { selectedProspectIds, toggleSelect, selectAll, clearSelection } = useAppStore()
  const visibleIds = rows.map((p) => p.id ?? p.apollo_id)
  const selectedVisibleCount = visibleIds.filter((id) => selectedProspectIds.has(id)).length
  const allSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const someSelected = selectedVisibleCount > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) clearSelection()
    else selectAll(visibleIds)
  }

  // Normalize rows so DS Table can diff on `id` and a couple of render
  // helpers have a single field to reference.
  const tableRows = rows.map(p => ({ ...p, id: p.id ?? p.apollo_id }))

  const columns = [
    ...(selectable ? [{
      key: '_select',
      label: (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={toggleAll}
          ariaLabel="Select all prospects"
        />
      ),
      width: 40,
      render: (_v, row) => (
        <Checkbox
          checked={selectedProspectIds.has(row.id)}
          onChange={() => toggleSelect(row.id)}
          ariaLabel={`Select ${row.first_name} ${row.last_name}`}
        />
      ),
    }] : []),
    {
      key: 'name',
      label: 'Name',
      render: (_v, p) => (
        <div>
          <div style={{ fontWeight: 500 }}>{p.first_name} {p.last_name}</div>
          {!compact && (
            <div style={{ fontSize: 11, color: 'var(--hk-text-muted)' }}>{p.email || '—'}</div>
          )}
        </div>
      ),
    },
    { key: 'title',    label: 'Title',    render: v => <span style={{ color: 'var(--hk-text-secondary)' }}>{v}</span> },
    { key: 'company',  label: 'Company' },
    ...(!compact ? [{ key: 'industry', label: 'Industry', render: v => v || '—' }] : []),
    {
      key: 'icp_score',
      label: 'ICP Score',
      render: v => <ScoreBar score={Math.round(v || 0)} max={100} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: v => <StatusBadge status={v || 'new'} styles={PROSPECT_STATUS_STYLES} />,
    },
  ]

  return (
    <Table
      columns={columns}
      rows={tableRows}
      emptyMessage="No prospects yet."
      // When selection is enabled we prefer a horizontally scrolling table
      // on mobile — the DS mobile-card layout would render the "select all"
      // checkbox as the label on every card, which reads awkwardly.
      mobileCard={!selectable}
    />
  )
}
