import GalleryFilmStrip from '@/components/gallery-film-strip'
import { getAssetGalleryPhotos } from '@/lib/gallery-assets'

export const dynamic = 'force-dynamic'

const longDate = new Intl.DateTimeFormat('it-IT', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function formatLongDate(date: string) {
  return longDate.format(new Date(`${date}T00:00:00`))
}

export default async function GalleryPage() {
  const photos = await getAssetGalleryPhotos()

  return (
    <section className="min-h-screen bg-charcoal px-6 pb-20 pt-24 text-cream md:px-10 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-[1600px]">
        <p className="text-xs uppercase tracking-[0.3em] text-cream/45">Diario visivo</p>
        <div className="mt-4 grid gap-6 border-b border-cream/12 pb-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div>
            <h1 className="font-display text-6xl uppercase leading-[0.84] md:text-8xl">
              Galleria
              <span className="block font-editorial text-[3.2rem] normal-case italic text-gold md:text-[5.2rem]">
                in 35mm
              </span>
            </h1>
          </div>
          <div className="space-y-4">
            <p className="max-w-2xl text-base leading-relaxed text-cream/72 md:text-lg">
              Un archivio di notti, persone, manifesti e tutto quello che nasce intorno alla visione condivisa.
            </p>
            {photos[0] ? (
              <p className="text-sm uppercase tracking-[0.18em] text-cream/48">
                Ultimo fotogramma / {formatLongDate(photos[photos.length - 1].date)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-10">
          <GalleryFilmStrip
            autoplay
            scale="full"
            surface="dark"
            photos={photos.map((photo) => ({
              ...photo,
              date: formatLongDate(photo.date),
            }))}
          />
        </div>
      </div>
    </section>
  )
}
