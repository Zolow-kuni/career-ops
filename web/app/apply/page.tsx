'use client'

import { useState } from 'react'

export default function ApplyPage() {
  const [question, setQuestion] = useState('')
  const [jd, setJd] = useState('')
  const [company, setCompany] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function generate() {
    if (!question.trim()) return
    setLoading(true)
    setError('')
    setResult('')
    try {
      const r = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, jd, company }),
      })
      const d = await r.json()
      if (d.ok) {
        setResult(d.result)
      } else {
        setError(d.error || 'Unknown error')
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Apply Assistant</h1>
        <p className="text-gray-500 text-sm mt-1">Generate honest, specific answers to application questions using your CV as the source of truth.</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">Company</label>
            <input value={company} onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Resend"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-700 placeholder-gray-600" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Application Question <span className="text-red-500">*</span>
          </label>
          <textarea value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. Why do you want to work at Resend? / Tell us about a time you used data to solve a hard problem."
            rows={3}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-700 placeholder-gray-600 resize-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Job Description <span className="text-gray-600">(optional — improves relevance)</span>
          </label>
          <textarea value={jd} onChange={e => setJd(e.target.value)}
            placeholder="Paste the JD here to get a more targeted answer…"
            rows={5}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-700 placeholder-gray-600 resize-none font-mono" />
        </div>

        <button onClick={generate} disabled={loading || !question.trim()}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900 disabled:text-teal-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating…
            </>
          ) : 'Generate Answer'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-800 bg-red-950/30 px-4 py-3">
          <p className="text-sm text-red-400 font-medium">Error</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
          {error.includes('ANTHROPIC_API_KEY') && (
            <p className="text-xs text-gray-500 mt-2">
              Add your API key to <code className="bg-gray-800 px-1 rounded">web/.env.local</code> as <code className="bg-gray-800 px-1 rounded">ANTHROPIC_API_KEY=sk-ant-...</code>
            </p>
          )}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-300">Generated Answer</h2>
            <button onClick={copy}
              className="text-xs px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
            {result}
          </div>
          <p className="text-xs text-gray-600 mt-2">Review before submitting. Never copy-paste without reading — make it yours.</p>
        </div>
      )}
    </div>
  )
}
