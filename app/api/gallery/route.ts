import { NextResponse } from 'next/server'
import { getAssetGalleryPhotos } from '@/lib/gallery-assets'
import { createGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto } from '@/lib/queries'

export async function GET() {
  return NextResponse.json(await getAssetGalleryPhotos())
}

export async function POST(req: Request) {
  const body = await req.json()
  await createGalleryPhoto(body)
  return NextResponse.json({ ok: true })
}

export async function PUT(req: Request) {
  const body = await req.json()
  await updateGalleryPhoto(body.id, body)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  await deleteGalleryPhoto(id)
  return NextResponse.json({ ok: true })
}
