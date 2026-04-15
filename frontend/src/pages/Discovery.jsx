import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PageHeader, Card, Input, Select, Button, ProgressBar, Stack, useToast,
} from '@hakunahq/ui'
import { api } from '../api/client.js'
import ProspectTable from '../components/ProspectTable.jsx'

const COMPANY_SIZES = ['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10000+']

export default function Discovery() {
  const qc = useQueryClient()
  const toast = useToast()
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

  const updateField = (key) => (value) => setForm(f => ({ ...f, [key]: value }))

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
    onSuccess: (r) => {
      setResults(r)
      toast.success(`Found ${r.length} matching prospect${r.length === 1 ? '' : 's'}`)
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Discovery failed'),
  })

  const saveMut = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/prospects/save', { prospects: results })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prospects'] })
      toast.success(`Added ${results.length} to your Prospects list`)
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Save failed'),
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="ICP Discovery"
        subtitle="Describe your ideal customer. We'll pull matching prospects and score them with Vertex AI."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="ICP description (natural language)"
            value={form.icp_description}
            onChange={updateField('icp_description')}
            multiline
            rows={4}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job titles (comma-separated)"
              value={form.titles}
              onChange={updateField('titles')}
            />
            <Select
              label="Company size"
              value={form.company_size}
              onChange={updateField('company_size')}
              options={COMPANY_SIZES}
            />
            <Input
              label="Industry"
              value={form.industry}
              onChange={updateField('industry')}
            />
            <Input
              label="Tech stack (comma-separated)"
              value={form.tech_stack}
              onChange={updateField('tech_stack')}
            />
            <Input
              label="Locations (comma-separated)"
              value={form.locations}
              onChange={updateField('locations')}
              placeholder="United States, London"
            />
          </div>

          <label className="block">
            <div className="text-xs font-semibold text-text-secondary mb-1">
              Minimum ICP score — <span className="font-mono">{form.min_score}</span>
            </div>
            <input
              type="range" min={40} max={95} value={form.min_score}
              onChange={(e) => setForm({ ...form, min_score: +e.target.value })}
              className="w-full accent-accent-green"
            />
          </label>

          <Stack gap={12}>
            <Button onClick={() => run.mutate()} loading={run.isPending} variant="success">
              {run.isPending ? 'Searching…' : 'Run discovery'}
            </Button>
            {results.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => saveMut.mutate()}
                loading={saveMut.isPending}
              >
                {saveMut.isPending ? 'Saving…' : `Add ${results.length} to Prospects`}
              </Button>
            )}
          </Stack>

          {run.isPending && (
            <ProgressBar
              value={100}
              striped
              showValue={false}
              color="var(--hk-success)"
              size="sm"
            />
          )}
        </Card>

        <div
          className="rounded-md p-5 shadow-card"
          style={{
            background: 'linear-gradient(135deg, var(--hk-success-subtle), var(--hk-primary-50))',
            border: '1px solid var(--hk-border)',
          }}
        >
          <div className="text-[10px] uppercase tracking-[0.22em] text-text-secondary font-semibold">How it works</div>
          <ol className="mt-3 space-y-3 text-sm text-text-secondary">
            {[
              'Apollo People Search pulls real candidates.',
              'Gemini scores each against your ICP.',
              'Review, then enroll into Lemlist.',
            ].map((step, i) => (
              <li key={i} className="flex gap-2">
                <span
                  className="flex-none w-5 h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center"
                  style={{ background: 'var(--hk-success)' }}
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {results.length > 0 && (
        <section className="space-y-3">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted font-semibold">
            Results · {results.length}
          </div>
          <ProspectTable rows={results} />
        </section>
      )}
    </div>
  )
}
