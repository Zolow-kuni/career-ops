import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)
const ROOT = path.resolve(process.cwd(), '..')

export async function POST() {
  try {
    const { stdout, stderr } = await execAsync('node scan.mjs', { cwd: ROOT, timeout: 120000 })
    const output = stdout || stderr
    const match = output.match(/New offers added:\s+(\d+)/)
    const count = match ? parseInt(match[1]) : 0
    const jobs: string[] = []
    const lines = output.split('\n')
    let inNew = false
    for (const line of lines) {
      if (line.includes('New offers:')) { inNew = true; continue }
      if (inNew && line.startsWith('  +')) jobs.push(line.replace('  + ', '').trim())
      if (inNew && line === '') inNew = false
    }
    return NextResponse.json({ ok: true, count, jobs, raw: output })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
