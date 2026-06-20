import { NextResponse } from 'next/server'
import { getSeatsByScreening, updateSeatStatus } from '@/lib/queries'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const screeningId = Number(params.id)
  return NextResponse.json(await getSeatsByScreening(screeningId))
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const screeningId = Number(params.id)
  const body = await req.json()
  if (Array.isArray(body)) {
    await Promise.all(body.map(({ id, status }: { id: number; status: string }) => updateSeatStatus(id, status)))
  } else {
    await updateSeatStatus(body.id, body.status)
  }
  return NextResponse.json(await getSeatsByScreening(screeningId))
}
