import { NextResponse } from 'next/server'
import { readTracker, updateApplicationStatus } from '@/lib/data'

export async function GET() {
  const apps = readTracker()
  return NextResponse.json(apps)
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json()
  updateApplicationStatus(id, status)
  return NextResponse.json({ ok: true })
}
