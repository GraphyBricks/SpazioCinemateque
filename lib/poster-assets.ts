import { promises as fs, readFileSync } from 'fs'
import path from 'path'
import { cache } from 'react'

export type AssetPoster = {
  height: number
  name: string
  src: string
  width: number
}

const POSTERS_DIR = path.join(process.cwd(), 'assets', 'images', 'posters')

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

  return { width: 1350, height: 1688 }
}

export const getAssetPosters = cache(async (): Promise<AssetPoster[]> => {
  const entries = await fs.readdir(POSTERS_DIR, { withFileTypes: true })

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const filePath = path.join(POSTERS_DIR, entry.name)
      const size = getImageSize(filePath)

      return {
        height: size.height,
        name: entry.name,
        src: `/api/poster-assets/${encodeURIComponent(entry.name)}`,
        width: size.width,
      }
    })

  return files.sort((a, b) => a.name.localeCompare(b.name))
})

export function getPosterPath(name: string): string {
  return `/api/poster-assets/${encodeURIComponent(name)}`
}
