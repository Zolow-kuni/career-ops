import { NextResponse } from 'next/server'
import { ask } from '@/lib/claude'
import { readCV } from '@/lib/data'

export async function POST(req: Request) {
  const { question, jd, company } = await req.json()
  const cv = readCV()

  const system = `You are a career coach helping a candidate write application answers.
Be genuine, specific, and concise. Draw only from the candidate's real CV — never fabricate.`

  const prompt = `Write a compelling written answer to this application question.

Company: ${company}
Role JD: ${jd}
CV: ${cv}

Question: "${question}"

Write a 150-200 word answer that is honest, specific to the candidate's experience, and directly addresses what the company is asking for.`

  try {
    const result = await ask(system, prompt)
    return NextResponse.json({ ok: true, result })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
