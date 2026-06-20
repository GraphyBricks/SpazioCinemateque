import { requireAuth } from '@/lib/admin-auth'
import { getMovies, getScreenings, getEvents, getGalleryPhotos, getReservations } from '@/lib/queries'
import AdminDashboard from '@/components/admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  requireAuth()
  const [movies, screenings, events, gallery, reservations] = await Promise.all([
    getMovies(),
    getScreenings(),
    getEvents(),
    getGalleryPhotos(),
    getReservations(),
  ])

  return (
    <section className="min-h-screen pt-32 md:pt-40 pb-24 md:pb-40 px-6 md:px-12 bg-cream">
      <AdminDashboard
        initialMovies={movies}
        initialScreenings={screenings}
        initialEvents={events}
        initialGallery={gallery}
        initialReservations={reservations}
      />
    </section>
  )
}
