import { NextResponse } from 'next/server'
import { readCV, writeCV } from '@/lib/data'

export async function GET() {
  return NextResponse.json({ content: readCV() })
}

export async function POST(req: Request) {
  const { content } = await req.json()
  writeCV(content)
  return NextResponse.json({ ok: true })
}
