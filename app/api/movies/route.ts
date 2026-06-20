import { NextResponse } from 'next/server'
import { getMovies, createMovie, updateMovie, deleteMovie } from '@/lib/queries'
import { isAuthenticated } from '@/lib/admin-auth'

function unauthorized() {
  return NextResponse.json({ ok: false }, { status: 401 })
}

export async function GET() {
  if (!isAuthenticated()) return unauthorized()
  return NextResponse.json(await getMovies())
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return unauthorized()
  const body = await req.json()
  await createMovie(body)
  return NextResponse.json({ ok: true })
}

export async function PUT(req: Request) {
  if (!isAuthenticated()) return unauthorized()
  const body = await req.json()
  await updateMovie(body.id, body)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  if (!isAuthenticated()) return unauthorized()
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  await deleteMovie(id)
  return NextResponse.json({ ok: true })
}
