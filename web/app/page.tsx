'use client'

import { useEffect, useState } from 'react'

type Application = {
  id: number; date: string; company: string; role: string
  score: string; status: string; pdf: string; report: string; notes: string
}

const STATUS_COLORS: Record<string, string> = {
  Applied: 'bg-blue-500/20 text-blue-300',
  Evaluated: 'bg-yellow-500/20 text-yellow-300',
  Interview: 'bg-purple-500/20 text-purple-300',
  Offer: 'bg-green-500/20 text-green-300',
  Rejected: 'bg-red-500/20 text-red-300',
  Discarded: 'bg-gray-500/20 text-gray-400',
  SKIP: 'bg-gray-600/20 text-gray-500',
}

const STATUSES = ['Evaluated', 'Applied', 'Responded', 'Interview', 'Offer', 'Rejected', 'Discarded', 'SKIP']

function scoreColor(score: string) {
  const n = parseFloat(score)
  if (n >= 4) return 'text-green-400'
  if (n >= 3) return 'text-yellow-400'
  return 'text-red-400'
}

export default function TrackerPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tracker').then(r => r.json()).then(d => { setApps(d); setLoading(false) })
  }, [])

  async function updateStatus(id: number, status: string) {
    await fetch('/api/tracker', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)
  const stats = { total: apps.length, applied: apps.filter(a => a.status === 'Applied').length, interview: apps.filter(a => a.status === 'Interview').length, offer: apps.filter(a => a.status === 'Offer').length }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Applications Tracker</h1>
        <div className="flex gap-4 text-sm">
          {[['Total', stats.total, 'text-gray-400'], ['Applied', stats.applied, 'text-blue-400'], ['Interview', stats.interview, 'text-purple-400'], ['Offer', stats.offer, 'text-green-400']].map(([label, val, cls]) => (
            <div key={label as string} className="text-center">
              <div className={`text-xl font-bold ${cls}`}>{val}</div>
              <div className="text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filter === s ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? <div className="text-gray-500">Loading...</div> : (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                {['#', 'Date', 'Company', 'Role', 'Score', 'Status', 'PDF', 'Notes'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{a.id}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{a.date}</td>
                  <td className="px-4 py-3 font-medium">{a.company}</td>
                  <td className="px-4 py-3 text-gray-300 max-w-48 truncate">{a.role}</td>
                  <td className={`px-4 py-3 font-bold ${scoreColor(a.score)}`}>{a.score}</td>
                  <td className="px-4 py-3">
                    <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded border-0 font-medium cursor-pointer ${STATUS_COLORS[a.status] || 'bg-gray-700 text-gray-300'}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">{a.pdf === '✅' ? '✅' : '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-48 truncate">{a.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No applications yet.</div>}
        </div>
      )}
    </div>
  )
}
