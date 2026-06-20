import { notFound } from 'next/navigation'
import { getScreeningById, getSeatsByScreening } from '@/lib/queries'
import ReservationFlow from '@/components/reservation-flow'

export const dynamic = 'force-dynamic'

export default async function ReserveDetailPage({ params }: { params: { id: string } }) {
  const screening = await getScreeningById(Number(params.id))
  if (!screening) return notFound()
  const seats = await getSeatsByScreening(screening.id)

  return (
    <section className="min-h-screen pt-24 md:pt-28 pb-20 md:pb-32 px-6 md:px-10 bg-cream">
      <div className="max-w-[1200px] mx-auto">
        <ReservationFlow screening={screening} seats={seats} />
      </div>
    </section>
  )
}
