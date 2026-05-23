import { NextResponse } from 'next/server'
import { readPipeline } from '@/lib/data'

export async function GET() {
  const jobs = readPipeline()
  return NextResponse.json(jobs)
}
