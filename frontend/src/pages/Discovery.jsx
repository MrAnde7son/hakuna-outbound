import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client.js'
import ProspectTable from '../components/ProspectTable.jsx'

export default function Discovery() {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    icp_description: 'Security leaders at US fintechs currently using Tenable, evaluating new vuln management',
    titles: 'CISO, VP Security, Head of Security',
    company_size: '201-500',
    industry: 'fintech',
    tech_stack: 'Tenable, AWS',
    locations: 'United States',
    min_score: 70,
  })
  const [results, setResults] = useState([])

  const run = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        titles: form.titles.split(',').map((s) => s.trim()).filter(Boolean),
        locations: form.locations.split(',').map((s) => s.trim()).filter(Boolean),
      }
      const { data } = await api.post('/api/discovery/run', payload)
      return data.prospects
    },
    onSuccess: (r) => setResults(r),
  })

  const saveMut = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/prospects/save', { prospects: results })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prospects'] })
    },
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">ICP Discovery</h1>
        <p className="text-muted text-sm mt-1">Describe your ideal customer. We'll pull matching prospects and score them with Vertex AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-4 sm:p-6 space-y-4 shadow-card">
          <Field label="ICP description (natural language)">
            <textarea
              value={form.icp_description}
              onChange={(e) => setForm({ ...form, icp_description: e.target.value })}
              rows={4}
              className="w-full bg-white border border-border rounded-md px-4 py-3 text-sm text-ink outline-none focus:border-accent-green focus:ring-2 focus:ring-accent-green-soft resize-none transition"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Job titles (comma-separated)">
              <input value={form.titles} onChange={(e) => setForm({ ...form, titles: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Company size">
              <select value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })} className={inputCls}>
                {['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10000+'].map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Industry">
              <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Tech stack (comma-separated)">
              <input value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Locations (comma-separated)">
              <input value={form.locations} onChange={(e) => setForm({ ...form, locations: e.target.value })} className={inputCls} placeholder="United States, London" />
            </Field>
          </div>
          <Field label={`Minimum ICP score — ${form.min_score}`}>
            <input
              type="range" min={40} max={95} value={form.min_score}
              onChange={(e) => setForm({ ...form, min_score: +e.target.value })}
              className="w-full accent-accent-green"
            />
          </Field>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => run.mutate()}
              disabled={run.isPending}
              className="px-5 py-2.5 bg-accent-green text-white font-medium rounded-md text-sm hover:bg-emerald-600 transition disabled:opacity-40 shadow-sm"
            >
              {run.isPending ? 'Searching…' : 'Run discovery'}
            </button>
            {results.length > 0 && (
              <button
                onClick={() => saveMut.mutate()}
                disabled={saveMut.isPending}
                className="px-5 py-2.5 border border-emerald-200 bg-accent-green-soft text-accent-green font-medium rounded-md text-sm hover:bg-emerald-100 transition"
              >
                {saveMut.isPending ? 'Saving…' : `Add ${results.length} to Prospects`}
              </button>
            )}
          </div>
          {run.isPending && (
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-full progress-stripe bg-accent-green" />
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-accent-green-soft to-accent-blue-soft border border-border rounded-xl p-4 sm:p-6 shadow-card">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-700 font-semibold">How it works</div>
          <ol className="mt-3 space-y-3 text-sm text-slate-700">
            <li className="flex gap-2"><span className="flex-none w-5 h-5 rounded-full bg-accent-green text-white text-[11px] font-bold flex items-center justify-center">1</span><span>Apollo People Search pulls real candidates.</span></li>
            <li className="flex gap-2"><span className="flex-none w-5 h-5 rounded-full bg-accent-green text-white text-[11px] font-bold flex items-center justify-center">2</span><span>Gemini scores each against your ICP.</span></li>
            <li className="flex gap-2"><span className="flex-none w-5 h-5 rounded-full bg-accent-green text-white text-[11px] font-bold flex items-center justify-center">3</span><span>Review, then enroll into Lemlist.</span></li>
          </ol>
        </div>
      </div>

      {results.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted font-semibold">Results · {results.length}</div>
          </div>
          <ProspectTable rows={results} />
        </section>
      )}
    </div>
  )
}

const inputCls = 'w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-accent-green focus:ring-2 focus:ring-accent-green-soft transition'

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted mb-1.5 font-semibold">{label}</div>
      {children}
    </label>
  )
}
