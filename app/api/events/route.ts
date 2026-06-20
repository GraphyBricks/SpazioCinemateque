import { NextResponse } from 'next/server'
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/queries'

export async function GET() {
  return NextResponse.json(await getEvents())
}

export async function POST(req: Request) {
  const body = await req.json()
  await createEvent(body)
  return NextResponse.json({ ok: true })
}

export async function PUT(req: Request) {
  const body = await req.json()
  await updateEvent(body.id, body)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  await deleteEvent(id)
  return NextResponse.json({ ok: true })
}
