import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'spazio2024'
const SESSION_COOKIE = 'spazio_admin_session'

export async function POST(req: Request) {
  const { password } = await req.json()
  if (password === ADMIN_PASSWORD) {
    cookies().set(SESSION_COOKIE, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ ok: false }, { status: 401 })
}

export async function DELETE() {
  cookies().delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = cookies().get(SESSION_COOKIE)
  return NextResponse.json({ authenticated: session?.value === 'authenticated' })
}
