import { NextResponse } from 'next/server'
import { ask } from '@/lib/claude'
import { readCV } from '@/lib/data'

export async function POST(req: Request) {
  const { jd } = await req.json()
  const cv = readCV()

  const system = `You are an expert career coach evaluating job fit. Be concise and direct.`
  const prompt = `Evaluate this job description against the candidate's CV. Give:
1. A score from 1-5 (with one decimal)
2. Top 3 matching strengths (bullet points)
3. Top 3 gaps (bullet points)
4. One-sentence recommendation (apply / stretch apply / skip)

CV:
${cv}

Job Description:
${jd}`

  try {
    const result = await ask(system, prompt)
    return NextResponse.json({ ok: true, result })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
