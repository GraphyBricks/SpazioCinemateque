import EditorialImage from '@/components/editorial-image'
import type { AssetGalleryPhoto } from '@/lib/gallery-assets'

type GalleryFilmStripProps = {
  autoplay?: boolean
  photos: AssetGalleryPhoto[]
  scale?: 'preview' | 'full'
  surface?: 'dark' | 'light'
}

export default function GalleryFilmStrip({
  autoplay = false,
  photos,
  scale = 'preview',
  surface = 'light',
}: GalleryFilmStripProps) {
  const repeatedPhotos = autoplay ? [...photos, ...photos] : photos
  const frameWidth =
    scale === 'preview'
      ? 'basis-[180px] md:basis-[210px] lg:basis-[228px]'
      : 'basis-[210px] md:basis-[250px] lg:basis-[290px]'
  const frameHeight =
    scale === 'preview'
      ? 'h-[150px] md:h-[168px] lg:h-[182px]'
      : 'h-[168px] md:h-[200px] lg:h-[230px]'

  return (
    <div
      className={`film-contact-sheet film-contact-sheet--${surface} ${autoplay ? 'film-contact-sheet--animated' : ''}`}
      style={{ ['--film-duration' as string]: `${Math.max(32, photos.length * 5.5)}s` }}
    >
      <div className="film-contact-sheet__glow" aria-hidden="true" />
      <div className="film-contact-sheet__scroll">
        <div className="film-contact-sheet__track">
          {repeatedPhotos.map((photo, index) => (
            <figure
              key={`${photo.id}-${index}`}
              className={`film-contact-sheet__frame ${frameWidth} ${frameHeight} group`}
            >
              <div className="film-contact-sheet__image-wrap">
                <EditorialImage
                  src={photo.src}
                  alt={photo.alt}
                  className="object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.06]"
                  priority={index < Math.min(photos.length, 4)}
                  sizes={scale === 'preview' ? '(max-width: 768px) 180px, 228px' : '(max-width: 768px) 210px, 290px'}
                  fallbackMeta="Archivio Spazio"
                  fallbackTitle={photo.caption}
                />
                <div className="film-contact-sheet__vignette" aria-hidden="true" />
                <div className="film-contact-sheet__caption">
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg uppercase leading-none md:text-[1.35rem]">{photo.caption}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-cream/62 md:text-[11px]">{photo.date}</p>
                  </div>
                  <span className="font-display text-[2.3rem] leading-none text-gold/90 md:text-[2.8rem]">
                    {String((index % photos.length) + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
