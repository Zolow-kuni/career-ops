'use client'

import { useState } from 'react'

type ScanResult = {
  ok: boolean
  newCount: number
  jobs: { company: string; role: string; location: string; url: string }[]
  error?: string
  raw?: string
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)

  async function runScan() {
    setScanning(true)
    setResult(null)
    try {
      const r = await fetch('/api/scan', { method: 'POST' })
      const d = await r.json()
      setResult(d)
    } catch (e) {
      setResult({ ok: false, newCount: 0, jobs: [], error: String(e) })
    } finally {
      setScanning(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Scan</h1>
          <p className="text-gray-500 text-sm mt-1">Search configured portals for new job openings matching your profile.</p>
        </div>
        <button onClick={runScan} disabled={scanning}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900 disabled:text-teal-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
          {scanning ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scanning…
            </>
          ) : 'Run Scan'}
        </button>
      </div>

      {!result && !scanning && (
        <div className="rounded-lg border border-gray-800 p-8 text-center text-gray-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>Click <strong className="text-gray-300">Run Scan</strong> to search all configured portals.</p>
          <p className="text-xs mt-2">Reads from <code className="bg-gray-800 px-1 rounded">portals.yml</code> — add companies there to expand coverage.</p>
        </div>
      )}

      {scanning && (
        <div className="rounded-lg border border-gray-800 p-8 text-center text-gray-400">
          <div className="text-4xl mb-3 animate-pulse">🔄</div>
          <p>Scanning portals…</p>
          <p className="text-xs mt-2 text-gray-600">This can take 30–60 seconds. Hang tight.</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${result.ok ? 'border-green-800 bg-green-950/30' : 'border-red-800 bg-red-950/30'}`}>
            <span className="text-xl">{result.ok ? '✅' : '❌'}</span>
            <div>
              {result.ok
                ? <span className="font-medium">{result.newCount} new job{result.newCount !== 1 ? 's' : ''} added to pipeline</span>
                : <span className="font-medium text-red-400">Scan failed</span>}
              {result.error && <p className="text-xs text-red-400 mt-0.5">{result.error}</p>}
            </div>
          </div>

          {result.jobs.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">New Jobs Found</h2>
              <div className="rounded-lg border border-gray-800 divide-y divide-gray-800/50">
                {result.jobs.map((job, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-900/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{job.company}</span>
                        <span className="text-gray-300 truncate">{job.role}</span>
                        {job.location && (
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{job.location}</span>
                        )}
                      </div>
                    </div>
                    {job.url && job.url !== '#' && (
                      <a href={job.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex-shrink-0">
                        Open ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">Go to <a href="/pipeline" className="text-teal-500 hover:text-teal-400">Pipeline</a> to review and evaluate.</p>
            </div>
          )}

          {result.ok && result.jobs.length === 0 && (
            <p className="text-sm text-gray-500">No new jobs this time — all found roles were already in the tracker.</p>
          )}

          {result.raw && (
            <details className="text-xs">
              <summary className="text-gray-600 cursor-pointer hover:text-gray-400">Raw output</summary>
              <pre className="mt-2 bg-gray-900 rounded p-3 text-gray-400 overflow-x-auto whitespace-pre-wrap">{result.raw}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
