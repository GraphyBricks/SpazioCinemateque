import { promises as fs, readFileSync } from 'fs'
import path from 'path'
import { cache } from 'react'

export type AssetGalleryPhoto = {
  alt: string
  caption: string
  date: string
  height: number
  id: string
  src: string
  width: number
}

const GALLERY_DIR = path.join(process.cwd(), 'assets', 'images', 'gallery')

const captions = [
  'Ritratto d\'archivio',
  'Proiezione notturna',
  'Dettaglio manifesto',
  'Conversazione tardiva',
  'Momento all\'aperto',
  'Memoria di proiezione',
  'Fermo immagine del pubblico',
  'Bagliore tra le stanze',
  'Notte di programma',
]

function formatDate(value: Date) {
  return value.toISOString().split('T')[0]
}

function getImageSize(filePath: string) {
  const buffer = readFileSync(filePath)

  if (buffer.length > 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1
        continue
      }

      const marker = buffer[offset + 1]
      const length = buffer.readUInt16BE(offset + 2)

      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        }
      }

      offset += 2 + length
    }
  }

  return { width: 1440, height: 1920 }
}

export const getAssetGalleryPhotos = cache(async (): Promise<AssetGalleryPhoto[]> => {
  const entries = await fs.readdir(GALLERY_DIR, { withFileTypes: true })

  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const filePath = path.join(GALLERY_DIR, entry.name)
        const stats = await fs.stat(filePath)
        const size = getImageSize(filePath)

        return {
          alt: `Immagine della galleria Spazio Cinematheque ${entry.name}`,
          caption: 'Fotogramma d\'archivio',
          date: formatDate(stats.mtime),
          height: size.height,
          id: entry.name,
          mtime: stats.mtimeMs,
          name: entry.name,
          src: `/api/gallery-assets/${encodeURIComponent(entry.name)}`,
          width: size.width,
        }
      })
  )

  return files
    .sort((a, b) => a.mtime - b.mtime)
    .map((file, index) => ({
      alt: file.alt,
      caption: captions[index] ?? `Fotogramma d'archivio ${String(index + 1).padStart(2, '0')}`,
      date: file.date,
      height: file.height,
      id: file.id,
      src: file.src,
      width: file.width,
    }))
})
