import Link from 'next/link'
import EditorialImage from '@/components/editorial-image'
import SectionReveal from '@/components/section-reveal'
import { getFeaturedScreening } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const dateFormat = new Intl.DateTimeFormat('it-IT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export default function SchedulePage() {
  const screening = getFeaturedScreening()

  return (
    <section className="min-h-screen bg-cream px-6 pb-20 pt-28 md:px-10 md:pb-32 md:pt-36">
      <div className="mx-auto max-w-[1500px]">
        <SectionReveal>
          <p className="eyebrow">Un appuntamento alla volta</p>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <h1 className="section-title">La prossima serata</h1>
            <p className="max-w-xl text-lg leading-relaxed text-charcoal/68 lg:justify-self-end">
              Non c'è un catalogo infinito da scorrere. Ogni incontro si costruisce attorno a un film e alle persone che vengono a condividerlo.
            </p>
          </div>
        </SectionReveal>

        {screening ? (
          <SectionReveal delay={120}>
            <article className="mt-12 overflow-hidden border border-charcoal/12 bg-parchment md:mt-16">
              <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
                <div className="relative min-h-[32rem] overflow-hidden bg-charcoal md:min-h-[44rem]">
                  <EditorialImage
                    src={screening.movie_poster_url || ''}
                    alt={screening.movie_title || ''}
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    fallbackMeta={screening.movie_director}
                    fallbackTitle={screening.movie_title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/76 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-charcoal/16" />
                  <p className="absolute left-5 top-5 border border-cream/24 bg-charcoal/72 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream">
                    Prossimo incontro
                  </p>
                </div>

                <div className="flex flex-col justify-between p-7 md:p-10 lg:p-14">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-terra/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-terra">{screening.movie_genre}</span>
                      <span className="bg-charcoal/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-charcoal/62">{screening.movie_duration} min</span>
                    </div>

                    <h2 className="mt-7 font-display text-6xl uppercase leading-[0.84] md:text-8xl lg:text-9xl">
                      {screening.movie_title}
                    </h2>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-terra">
                      un film di {screening.movie_director}
                    </p>
                    <p className="mt-8 max-w-2xl text-base leading-relaxed text-charcoal/72 md:text-lg">
                      {screening.movie_description}
                    </p>
                  </div>

                  <div className="mt-12">
                    <div className="grid gap-5 border-y border-charcoal/12 py-6 sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-stone">Quando</p>
                        <p className="mt-2 font-editorial text-2xl italic capitalize">{dateFormat.format(new Date(screening.date + 'T00:00:00'))}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-stone">Ora</p>
                        <p className="mt-2 font-display text-3xl">ORE {screening.time}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-stone">Dove</p>
                        <p className="mt-2 font-editorial text-2xl italic">Secret location · Nola</p>
                      </div>
                    </div>
                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-charcoal/58">
                      Il link Google Maps con l'indirizzo preciso appare solo dopo la prenotazione. I posti non sono assegnati: lo spazio è condiviso e libero.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-4">
                      <Link href={'/reserve/' + screening.id} className="btn-gold">Tieni un posto</Link>
                      <Link href="/about" className="btn-outline">Conosci lo spazio</Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </SectionReveal>
        ) : (
          <SectionReveal delay={120}>
            <div className="paper-panel mt-12 p-8 md:mt-16 md:p-14">
              <h2 className="font-display text-5xl uppercase">La prossima data sta arrivando</h2>
              <p className="mt-4 max-w-2xl text-lg text-charcoal/68">Stiamo scegliendo il film e spostando qualche sedia. Torna presto o scrivici per sapere quando ci vediamo.</p>
              <Link href="/contact" className="btn-dark mt-8">Scrivici</Link>
            </div>
          </SectionReveal>
        )}
      </div>
    </section>
  )
}
