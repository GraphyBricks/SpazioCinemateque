import Link from 'next/link'
import EditorialImage from '@/components/editorial-image'
import GalleryFilmStrip from '@/components/gallery-film-strip'
import SectionReveal from '@/components/section-reveal'
import { getAssetGalleryPhotos } from '@/lib/gallery-assets'
import { getFeaturedScreening } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const longDate = new Intl.DateTimeFormat('it-IT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const shortDate = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
})

function formatDate(date: string) {
  return longDate.format(new Date(date + 'T00:00:00'))
}

export default async function HomePage() {
  const screening = await getFeaturedScreening()
  const gallery = (await getAssetGalleryPhotos()).slice(0, 9)

  return (
    <>
      <section className="relative overflow-hidden border-b border-charcoal/12 bg-cream">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(199,210,191,0.2),transparent_42%),radial-gradient(circle_at_86%_18%,rgba(212,168,32,0.14),transparent_30%)]" aria-hidden="true" />

        <div className="relative mx-auto max-w-[1600px] px-6 pb-20 pt-32 md:px-10 md:pb-28 md:pt-40">
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.72fr)] xl:items-center">
            <SectionReveal>
              <div className="max-w-5xl">
                <p className="eyebrow">Cinema condiviso · Nola</p>
                <h1 className="mt-8 text-charcoal">
                  <span className="block font-display text-[25vw] uppercase leading-[0.8] md:text-[10rem] lg:text-[12rem] xl:text-[14rem]">
                    Spazio
                  </span>
                  <span className="block pl-[4vw] font-editorial text-[17vw] italic leading-[0.78] text-terra md:pl-12 md:text-[6.6rem] lg:text-[7.8rem] xl:text-[8.8rem]">
                    Cinematheque
                  </span>
                </h1>

                <div className="mt-10 max-w-3xl border-l border-charcoal/18 pl-6 md:pl-8">
                  <p className="text-balance text-xl leading-relaxed text-charcoal/82 md:text-2xl">
                    Uno spazio indipendente nato dal desiderio semplice di scegliere film e guardarli insieme.
                  </p>
                  <p className="mt-4 font-editorial text-3xl italic leading-tight text-charcoal/68 md:text-4xl">
                    Un film alla volta, e una comunità diversa a ogni incontro.
                  </p>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href="/schedule" className="btn-dark">
                    Scopri la prossima serata
                  </Link>
                  {screening ? (
                    <Link href={'/reserve/' + screening.id} className="btn-gold">
                      Tieni un posto
                    </Link>
                  ) : null}
                </div>
              </div>
            </SectionReveal>

            {screening ? (
              <SectionReveal delay={140}>
                <Link href="/schedule" className="group block">
                  <div className="dark-panel p-4 md:p-5">
                    <div className="image-frame aspect-[4/5] border-cream/12">
                      <EditorialImage
                        src={screening.movie_poster_url || ''}
                        alt={screening.movie_title || ''}
                        className="object-cover transition-transform duration-700 ease-fluid group-hover:scale-[1.03]"
                        priority
                        sizes="(max-width: 1280px) 100vw, 30vw"
                        fallbackMeta={screening.movie_director}
                        fallbackTitle={screening.movie_title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/12 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">La prossima serata</p>
                        <h2 className="mt-3 font-display text-5xl uppercase leading-[0.88] md:text-6xl">
                          {screening.movie_title}
                        </h2>
                        <p className="mt-3 text-sm uppercase tracking-[0.16em] text-cream/68">
                          {formatDate(screening.date)} · ore {screening.time}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </SectionReveal>
            ) : null}
          </div>
        </div>
      </section>

      {screening ? (
        <section className="bg-charcoal px-6 py-20 text-cream md:px-10 md:py-28">
          <div className="mx-auto grid max-w-[1600px] gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <SectionReveal>
              <div className="lg:sticky lg:top-36">
                <p className="eyebrow text-cream/56">Quello che vediamo</p>
                <p className="mt-8 font-display text-[7rem] leading-[0.72] text-gold md:text-[10rem]">
                  {new Date(screening.date + 'T00:00:00').getDate().toString().padStart(2, '0')}
                </p>
                <p className="mt-5 font-editorial text-4xl italic text-cream/72">{formatDate(screening.date)}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.2em] text-cream/48">Si comincia alle {screening.time}</p>
              </div>
            </SectionReveal>

            <SectionReveal delay={120}>
              <div className="border-t border-cream/14 pt-7">
                <div className="flex flex-wrap gap-2">
                  <span className="border border-cream/16 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-gold">{screening.movie_genre}</span>
                  <span className="border border-cream/16 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-cream/62">{screening.movie_duration} min</span>
                  <span className="border border-cream/16 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-cream/62">Secret location · Nola</span>
                </div>
                <h2 className="mt-7 font-display text-6xl uppercase leading-[0.86] md:text-8xl lg:text-9xl">
                  {screening.movie_title}
                </h2>
                <p className="mt-5 text-sm uppercase tracking-[0.2em] text-gold">di {screening.movie_director}</p>
                <p className="mt-8 max-w-3xl text-lg leading-relaxed text-cream/72 md:text-xl">
                  {screening.movie_description}
                </p>

                <div className="mt-10 grid gap-6 border-y border-cream/12 py-7 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cream/42">Prima</p>
                    <p className="mt-2 text-sm leading-relaxed text-cream/72">Ci si incontra, si scambiano due parole e il pubblico prende forma.</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cream/42">Durante</p>
                    <p className="mt-2 text-sm leading-relaxed text-cream/72">Luci basse, telefoni via. Per qualche ora condividiamo lo stesso sguardo.</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cream/42">Dopo</p>
                    <p className="mt-2 text-sm leading-relaxed text-cream/72">Si resta a parlarne. È spesso la parte più bella della serata.</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href={'/reserve/' + screening.id} className="btn-gold">
                    Tieni il tuo posto
                  </Link>
                  <Link href="/about" className="border border-cream/24 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-cream hover:text-charcoal">
                    Come funziona
                  </Link>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      ) : null}

      <section className="bg-cream px-6 py-20 text-charcoal md:px-10 md:py-28">
        <div className="mx-auto max-w-[1600px]">
          <SectionReveal>
            <div className="grid gap-6 border-b border-charcoal/12 pb-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
              <div>
                <p className="eyebrow mb-4">Il nostro diario</p>
                <h2 className="font-display text-5xl uppercase leading-[0.88] md:text-7xl">
                  Serate passate
                  <span className="block font-editorial text-[3rem] normal-case italic text-terra md:text-[4.5rem]">
                    tra amici e sconosciuti
                  </span>
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-charcoal/72 md:text-lg">
                Fotogrammi di chi è passato di qui: il proiettore acceso, bicchieri sul tavolo e discussioni che hanno fatto tardi.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={120}>
            <div className="mt-10">
              <GalleryFilmStrip
                autoplay
                photos={gallery.map((photo) => ({
                  ...photo,
                  date: shortDate.format(new Date(photo.date + 'T00:00:00')),
                }))}
                surface="light"
              />
            </div>
          </SectionReveal>

          <SectionReveal delay={220}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/gallery" className="btn-outline">Sfoglia l'album</Link>
              <Link href="/contact" className="btn-dark">Scrivici</Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
