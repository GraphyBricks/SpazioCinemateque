import { NextResponse } from 'next/server'
import { getScreenings, createScreening, updateScreening, deleteScreening } from '@/lib/queries'

export async function GET() {
  return NextResponse.json(await getScreenings())
}

export async function POST(req: Request) {
  const body = await req.json()
  await createScreening(body)
  return NextResponse.json({ ok: true })
}

export async function PUT(req: Request) {
  const body = await req.json()
  await updateScreening(body.id, body)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  await deleteScreening(id)
  return NextResponse.json({ ok: true })
}
