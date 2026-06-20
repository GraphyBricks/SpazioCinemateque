import { NextResponse } from 'next/server'
import { getSeatsByScreening, updateSeatStatus } from '@/lib/queries'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const screeningId = Number(params.id)
  return NextResponse.json(getSeatsByScreening(screeningId))
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const screeningId = Number(params.id)
  const body = await req.json()
  if (Array.isArray(body)) {
    for (const { id, status } of body) updateSeatStatus(id, status)
  } else {
    updateSeatStatus(body.id, body.status)
  }
  return NextResponse.json(getSeatsByScreening(screeningId))
}
