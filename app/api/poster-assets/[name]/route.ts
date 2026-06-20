import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export async function GET(_: Request, { params }: { params: { name: string } }) {
  const fileName = path.basename(decodeURIComponent(params.name))
  const filePath = path.join(process.cwd(), 'assets', 'images', 'posters', fileName)
  const ext = path.extname(fileName).toLowerCase()

  try {
    const buffer = await fs.readFile(filePath)

    return new NextResponse(buffer, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': mimeTypes[ext] ?? 'application/octet-stream',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
