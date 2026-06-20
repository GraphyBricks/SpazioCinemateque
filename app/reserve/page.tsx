import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getFeaturedScreening } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function ReservePage() {
  const screening = await getFeaturedScreening()

  if (screening) redirect('/reserve/' + screening.id)

  return (
    <section className="min-h-screen bg-cream px-6 pb-20 pt-32 md:px-10 md:pb-32 md:pt-40">
      <div className="paper-panel mx-auto max-w-3xl p-8 text-center md:p-14">
        <p className="eyebrow">Prenotazioni</p>
        <h1 className="mt-6 font-display text-6xl uppercase leading-[0.88] md:text-8xl">Ancora un po' di pazienza</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-charcoal/68">
          La prossima serata non ha ancora una data. Appena scegliamo film e giorno, qui potrai tenere il tuo posto.
        </p>
        <Link href="/contact" className="btn-dark mt-8">Scrivici</Link>
      </div>
    </section>
  )
}
