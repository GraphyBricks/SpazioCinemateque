import { NextResponse } from 'next/server'
import { getReservations, createReservation, deleteReservation, generateConfirmationCode, getMovieMapsUrlForScreening } from '@/lib/queries'

export async function GET() {
  return NextResponse.json(await getReservations())
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const code = generateConfirmationCode()
    await createReservation(
      {
        screening_id: body.screening_id,
        customer_name: body.customer_name,
        email: body.email,
        phone: body.phone,
        confirmation_code: code,
        status: 'confirmed',
      },
      body.seat_ids
    )
    return NextResponse.json({
      ok: true,
      confirmation_code: code,
      maps_url: await getMovieMapsUrlForScreening(body.screening_id),
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'I posti richiesti non sono più disponibili.' },
      { status: 409 }
    )
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  await deleteReservation(id)
  return NextResponse.json({ ok: true })
}
