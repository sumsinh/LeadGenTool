
import { useCallback, useEffect, useState } from 'react'
import {
  getLeads,
  getLeadStats,
  createLead,
  deleteDuplicates,
} from './services/api'

function App() {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({
    total_leads: 0,
    qualified_leads: 0,
    average_score: 0,
  })
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('All')
  const [minScore, setMinScore] = useState('0')
  const [activeNav, setActiveNav] = useState('Overview')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      setError('')
      const [leadData, statsData] = await Promise.all([
        getLeads(),
        getLeadStats(),
      ])
      setLeads(leadData)
      setStats(statsData)
    } catch (err) {
      setError(err.message || 'Unable to load leads.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredLeads = leads.filter((lead) => {
    const term = search.toLowerCase()
    const matchesSearch =
      `${lead.company} ${lead.industry} ${lead.email}`
        .toLowerCase()
        .includes(term)

    const matchesIndustry =
      industry === 'All' || lead.industry === industry

    const matchesScore = lead.score >= Number(minScore)

    const matchesNav =
      activeNav !== 'Qualified Leads' || lead.status === 'Qualified'

    return matchesSearch && matchesIndustry && matchesScore && matchesNav
  })

  async function handleAddLead() {
    const company = window.prompt('Enter the company name:')
    if (!company?.trim()) return

    try {
      await createLead({
        company: company.trim(),
        industry: 'Technology',
        company_size: '11-50',
        email: '',
        website: '',
        score: 70,
        status: 'New',
      })
      setNotice('Lead added successfully.')
      await loadData()
    } catch (err) {
      setNotice(err.message || 'Unable to add lead.')
    }
  }

  async function handleRemoveDuplicates() {
    try {
      const result = await deleteDuplicates()
      setNotice(`Removed ${result.removed} duplicate lead(s).`)
      await loadData()
    } catch (err) {
      setNotice(err.message || 'Unable to remove duplicates.')
    }
  }

  const averageScore = Math.round(Number(stats.average_score) || 0)

  function handleExportFiltered() {
  const headers = [
    'Company',
    'Industry',
    'Company Size',
    'Email',
    'Website',
    'Score',
    'Status',
  ]

  const rows = filteredLeads.map((lead) => [
    lead.company,
    lead.industry,
    lead.company_size,
    lead.email,
    lead.website,
    lead.score,
    lead.status,
  ])

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\r\n')

  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'filtered-leads.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  setNotice(`Exported ${filteredLeads.length} filtered lead(s).`)
}

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">L</div>
          <div>
            <h1 className="text-lg font-bold">LeadFlow</h1>
            <p className="text-xs text-slate-500">Lead intelligence</p>
          </div>
        </div>

        <p className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
        <nav className="space-y-2">
          {['Overview', 'All Leads', 'Qualified Leads'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium ${
                activeNav === item ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-slate-900 p-4 text-white">
          <p className="text-sm font-semibold">Find better prospects</p>
          <p className="mt-2 text-xs leading-5 text-slate-300">
            Organize leads, prioritize opportunities, and export your shortlist.
          </p>
        </div>
      </aside>

      <main className="lg:ml-64">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
          <div>
            <p className="text-sm text-slate-500">Workspace / {activeNav}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{activeNav}</h2>
          </div>
          <button onClick={handleAddLead} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            + Add lead
          </button>
        </header>

        <div className="space-y-6 p-5 sm:p-8">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
              <button onClick={loadData} className="ml-3 underline">Retry</button>
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total leads', value: stats.total_leads, note: 'Saved in database' },
              { label: 'Qualified leads', value: stats.qualified_leads, note: 'Marked qualified' },
              { label: 'Average lead score', value: `${averageScore}/100`, note: 'Across all leads' },
              { label: 'Matching results', value: filteredLeads.length, note: 'Based on your filters' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-2 text-xs text-slate-400">{stat.note}</p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Lead pipeline</h3>
                <p className="mt-1 text-sm text-slate-500">Manage leads stored in your database.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleRemoveDuplicates} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">
                  Remove duplicates
                </button>
                <button
  onClick={handleExportFiltered}
  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
>
  Export CSV ↓
</button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search companies, industries, emails..."
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
              <select
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
              >
                <option value="All">All industries</option>
                <option value="Technology">Technology</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Finance">Finance</option>
              </select>
              <select
                value={minScore}
                onChange={(event) => setMinScore(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
              >
                <option value="0">Any lead score</option>
                <option value="60">Score 60 and above</option>
                <option value="75">Score 75 and above</option>
                <option value="85">Score 85 and above</option>
              </select>
            </div>

            {notice && (
              <div className="mt-4 flex justify-between rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <span>{notice}</span>
                <button onClick={() => setNotice('')} aria-label="Dismiss notification">×</button>
              </div>
            )}

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-3 py-4">Company</th>
                    <th className="px-3 py-4">Industry</th>
                    <th className="px-3 py-4">Company size</th>
                    <th className="px-3 py-4">Lead score</th>
                    <th className="px-3 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="5" className="px-3 py-12 text-center text-slate-500">Loading leads...</td></tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr><td colSpan="5" className="px-3 py-12 text-center text-slate-500">No leads match your filters.</td></tr>
                  ) : filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="px-3 py-4">
                        <p className="font-semibold text-slate-800">{lead.company}</p>
                        <p className="mt-1 text-xs text-slate-500">{lead.email || 'No email provided'}</p>
                      </td>
                      <td className="px-3 py-4 text-slate-600">{lead.industry}</td>
                      <td className="px-3 py-4 text-slate-600">{lead.company_size}</td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${lead.score >= 85 ? 'bg-emerald-500' : lead.score >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="font-semibold">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          lead.status === 'Qualified' ? 'bg-emerald-50 text-emerald-700' :
                          lead.status === 'Contacted' ? 'bg-violet-50 text-violet-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{lead.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Showing {filteredLeads.length} of {leads.length} database leads.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
