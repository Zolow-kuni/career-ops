'use client'

import { useEffect, useState } from 'react'

type Job = {
  done: boolean
  url: string
  company: string
  role: string
  location: string
  raw: string
}

export default function PipelinePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all')

  useEffect(() => {
    fetch('/api/pipeline').then(r => r.json()).then(d => { setJobs(d); setLoading(false) })
  }, [])

  const filtered = jobs.filter(j => {
    if (filter === 'pending') return !j.done
    if (filter === 'done') return j.done
    return true
  })

  const pending = jobs.filter(j => !j.done).length
  const done = jobs.filter(j => j.done).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Job Pipeline</h1>
        <div className="flex gap-4 text-sm">
          {[['Total', jobs.length, 'text-gray-400'], ['Pending', pending, 'text-yellow-400'], ['Done', done, 'text-green-400']].map(([label, val, cls]) => (
            <div key={label as string} className="text-center">
              <div className={`text-xl font-bold ${cls}`}>{val}</div>
              <div className="text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="text-gray-500">Loading...</div> : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {filter === 'pending' ? 'No pending jobs — run a scan to find new openings.' : 'No jobs here.'}
            </div>
          )}
          {filtered.map((job, i) => (
            <div key={i} className={`flex items-start gap-4 px-4 py-3 rounded-lg border transition-colors ${job.done ? 'border-gray-800/40 opacity-50' : 'border-gray-800 hover:border-gray-700'}`}>
              <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${job.done ? 'bg-green-500' : 'bg-yellow-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-medium">{job.company}</span>
                  <span className="text-gray-300 truncate">{job.role}</span>
                  {job.location && (
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{job.location}</span>
                  )}
                </div>
                {job.url && job.url !== '#' && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-teal-400 hover:text-teal-300 mt-1 block truncate transition-colors">
                    {job.url}
                  </a>
                )}
              </div>
              <div className={`text-xs flex-shrink-0 px-2 py-1 rounded font-medium ${job.done ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {job.done ? 'Done' : 'Pending'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
