'use client'

import { useEffect, useState, useRef } from 'react'

export default function CVPage() {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch('/api/cv').then(r => r.json()).then(d => { setContent(d.content); setLoading(false) })
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/cv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      save()
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = textareaRef.current
      if (!el) return
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = content.substring(0, start) + '  ' + content.substring(end)
      setContent(next)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2 })
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const lineCount = content.split('\n').length

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">CV Builder</h1>
          <p className="text-gray-500 text-xs mt-0.5">Editing <code className="bg-gray-800 px-1 rounded">cv.md</code> — the canonical source used for all evaluations and applications</p>
        </div>
        <div className="flex items-center gap-3">
          {(saved || saving) && (
            <span className={`text-xs transition-opacity ${saved ? 'text-green-400' : 'text-gray-500'}`}>
              {saving ? 'Saving…' : 'Saved ✓'}
            </span>
          )}
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors">
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          {loading ? (
            <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-center text-gray-500">
              Loading…
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="flex-1 bg-gray-900 text-gray-100 rounded-lg border border-gray-800 p-4 font-mono text-sm resize-none focus:outline-none focus:border-teal-700 leading-relaxed"
              placeholder="# Your Name&#10;&#10;## Summary&#10;…"
            />
          )}
          <div className="flex gap-4 mt-2 text-xs text-gray-600">
            <span>{lineCount} lines</span>
            <span>{wordCount} words</span>
            <span>Ctrl+S to save · Tab inserts 2 spaces</span>
          </div>
        </div>

        <div className="w-72 flex-shrink-0 hidden lg:flex flex-col gap-3">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Tips</h3>
            <ul className="text-xs text-gray-500 space-y-2">
              <li><span className="text-gray-300"># Heading 1</span> — name / section</li>
              <li><span className="text-gray-300">## Heading 2</span> — sub-section</li>
              <li><span className="text-gray-300">**bold**</span> — job title, metrics</li>
              <li><span className="text-gray-300">- item</span> — bullet point</li>
              <li><span className="text-gray-300">*italic*</span> — dates, company names</li>
            </ul>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">CV Sections</h3>
            <ul className="text-xs text-gray-500 space-y-1.5">
              {['Summary', 'Experience', 'Projects', 'Education', 'Skills', 'Certifications'].map(s => {
                const present = content.includes(s)
                return (
                  <li key={s} className="flex items-center gap-2">
                    <span className={present ? 'text-green-400' : 'text-gray-700'}>
                      {present ? '✓' : '○'}
                    </span>
                    <span className={present ? 'text-gray-300' : ''}>{s}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
