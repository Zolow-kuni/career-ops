import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(process.cwd(), '..')

export function readFile(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8')
}

export function writeFile(rel: string, content: string) {
  fs.writeFileSync(path.join(ROOT, rel), content, 'utf-8')
}

export function fileExists(rel: string) {
  return fs.existsSync(path.join(ROOT, rel))
}

// ── Tracker ────────────────────────────────────────────────────────────────

export type Application = {
  id: number
  date: string
  company: string
  role: string
  score: string
  status: string
  pdf: string
  report: string
  notes: string
}

export function readTracker(): Application[] {
  const raw = readFile('data/applications.md')
  const lines = raw.split('\n').filter(l => l.startsWith('|') && !l.startsWith('| #') && !l.startsWith('|---'))
  return lines.map(line => {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean)
    return {
      id: parseInt(cols[0]) || 0,
      date: cols[1] || '',
      company: cols[2] || '',
      role: cols[3] || '',
      score: cols[4] || '',
      status: cols[5] || '',
      pdf: cols[6] || '',
      report: cols[7] || '',
      notes: cols[8] || '',
    }
  }).filter(a => a.id > 0)
}

export function updateApplicationStatus(id: number, status: string) {
  let raw = readFile('data/applications.md')
  const lines = raw.split('\n')
  const updated = lines.map(line => {
    if (!line.startsWith('|')) return line
    const cols = line.split('|').map(c => c.trim()).filter(Boolean)
    if (parseInt(cols[0]) === id) {
      cols[5] = ` ${status} `
      return '| ' + cols.join(' | ') + ' |'
    }
    return line
  })
  writeFile('data/applications.md', updated.join('\n'))
}

// ── Pipeline ───────────────────────────────────────────────────────────────

export type PipelineJob = {
  done: boolean
  url: string
  company: string
  role: string
  location: string
  raw: string
}

export function readPipeline(): PipelineJob[] {
  const raw = readFile('data/pipeline.md')
  const lines = raw.split('\n').filter(l => l.match(/^- \[[ x]\]/))
  return lines.map(line => {
    const done = line.startsWith('- [x]')
    const match = line.match(/https?:\/\/\S+/)
    const url = match ? match[0].split(' ')[0] : ''
    const rest = line.replace(/^- \[[ x]\]\s*/, '').replace(url, '').trim()
    const parts = rest.split('|').map(p => p.trim()).filter(Boolean)
    return {
      done,
      url,
      company: parts[0] || '',
      role: parts[1] || '',
      location: parts[2] || '',
      raw: line,
    }
  })
}

// ── CV ─────────────────────────────────────────────────────────────────────

export function readCV() {
  return readFile('cv.md')
}

export function writeCV(content: string) {
  writeFile('cv.md', content)
}

// ── Reports ────────────────────────────────────────────────────────────────

export function listReports() {
  const dir = path.join(ROOT, 'reports')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse()
}

export function readReport(filename: string) {
  return readFile(`reports/${filename}`)
}
