'use client'

import { useState, useEffect } from 'react'
import type { Movie, Screening, Event, GalleryPhoto, Reservation } from '@/lib/queries'

export default function AdminDashboard({
  initialMovies,
  initialScreenings,
  initialEvents,
  initialGallery,
  initialReservations,
}: {
  initialMovies: Movie[]
  initialScreenings: Screening[]
  initialEvents: Event[]
  initialGallery: GalleryPhoto[]
  initialReservations: Reservation[]
}) {
  const [tab, setTab] = useState<'screenings' | 'movies' | 'events' | 'gallery' | 'reservations' | 'seats'>('screenings')
  const [movies, setMovies] = useState(initialMovies)
  const [screenings, setScreenings] = useState(initialScreenings)
  const [events, setEvents] = useState(initialEvents)
  const [gallery, setGallery] = useState(initialGallery)
  const [reservations, setReservations] = useState(initialReservations)

  async function refresh() {
    const [m, s, e, g, r] = await Promise.all([
      fetch('/api/movies').then(r => r.json()),
      fetch('/api/screenings').then(r => r.json()),
      fetch('/api/events').then(r => r.json()),
      fetch('/api/gallery').then(r => r.json()),
      fetch('/api/reservations').then(r => r.json()),
    ])
    setMovies(m)
    setScreenings(s)
    setEvents(e)
    setGallery(g)
    setReservations(r)
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone mb-1 font-body">Staff Area</p>
          <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tight">Admin Dashboard</h1>
        </div>
        <form action="/api/admin/auth" method="post" onSubmit={async e => { e.preventDefault(); await fetch('/api/admin/auth', { method: 'DELETE' }); location.href = '/admin/login' }}>
          <button type="submit" className="btn-outline">Logout</button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 mb-10 border-b border-charcoal/10 pb-4">
        {(['screenings', 'movies', 'events', 'gallery', 'reservations', 'seats'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-body uppercase tracking-wider transition-all duration-300 ${tab === t ? 'bg-charcoal text-cream' : 'hover:bg-charcoal/5'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'movies' && <MoviesTab movies={movies} refresh={refresh} />}
      {tab === 'screenings' && <ScreeningsTab screenings={screenings} movies={movies} refresh={refresh} />}
      {tab === 'events' && <EventsTab events={events} refresh={refresh} />}
      {tab === 'gallery' && <GalleryTab gallery={gallery} refresh={refresh} />}
      {tab === 'reservations' && <ReservationsTab reservations={reservations} refresh={refresh} />}
      {tab === 'seats' && <SeatsTab screenings={screenings} />}
    </div>
  )
}

function MoviesTab({ movies, refresh }: { movies: Movie[]; refresh: () => void }) {
  const [editing, setEditing] = useState<Partial<Movie> | null>(null)

  async function save() {
    const method = editing?.id ? 'PUT' : 'POST'
    await fetch('/api/movies', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    setEditing(null)
    refresh()
  }

  async function remove(id: number) {
    if (!confirm('Delete this movie?')) return
    await fetch(`/api/movies?id=${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <div>
      <button onClick={() => setEditing({ title: '', description: '', director: '', genre: '', poster_url: '', maps_url: '', duration: 90 })} className="btn-gold mb-6">+ Add Movie</button>
      {editing && (
        <div className="border border-charcoal/10 p-6 mb-8 bg-cream">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Title" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input placeholder="Director" value={editing.director} onChange={e => setEditing({ ...editing, director: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input placeholder="Genre" value={editing.genre} onChange={e => setEditing({ ...editing, genre: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input placeholder="Duration (min)" type="number" value={editing.duration} onChange={e => setEditing({ ...editing, duration: Number(e.target.value) })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input placeholder="Poster URL" value={editing.poster_url} onChange={e => setEditing({ ...editing, poster_url: e.target.value })} className="md:col-span-2 px-4 py-3 rounded-sm bg-wheat outline-none" />
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">Google Maps secret location</label>
              <input
                type="url"
                placeholder="https://maps.app.goo.gl/..."
                value={editing.maps_url || ''}
                onChange={e => setEditing({ ...editing, maps_url: e.target.value })}
                className="w-full px-4 py-3 rounded-sm bg-wheat outline-none"
              />
              <p className="mt-2 text-xs text-stone">Private: shown to guests only after a successful reservation.</p>
            </div>
            <textarea placeholder="Description" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="md:col-span-2 px-4 py-3 rounded-sm bg-wheat outline-none" rows={3} />
            <div className="md:col-span-2 flex gap-3">
              <button onClick={save} className="btn-gold">Save</button>
              <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {movies.map(m => (
          <div key={m.id} className="border border-charcoal/10 bg-cream p-3">
            <div className="aspect-[2/3] relative mb-4 bg-stone/10">
              {m.poster_url && <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover" />}
            </div>
            <h3 className="font-display text-2xl uppercase">{m.title}</h3>
            <p className="text-stone text-sm mb-4 font-body">{m.director} / {m.genre} / {m.duration} min</p>
            <p className={'mb-4 text-xs font-semibold uppercase tracking-wider ' + (m.maps_url ? 'text-terra' : 'text-stone')}>
              {m.maps_url ? 'Secret location configured' : 'Secret location missing'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setEditing(m)} className="px-3 py-1.5 bg-charcoal/5 text-sm hover:bg-charcoal hover:text-cream transition-all duration-300 font-body uppercase tracking-wider">Edit</button>
              <button onClick={() => remove(m.id)} className="px-3 py-1.5 bg-terra/10 text-terra text-sm hover:bg-terra hover:text-cream transition-all duration-300 font-body uppercase tracking-wider">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreeningsTab({ screenings, movies, refresh }: { screenings: Screening[]; movies: Movie[]; refresh: () => void }) {
  const [editing, setEditing] = useState<Partial<Screening> | null>(null)

  async function save() {
    const method = editing?.id ? 'PUT' : 'POST'
    await fetch('/api/screenings', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editing, movie_id: Number(editing?.movie_id) }) })
    setEditing(null)
    refresh()
  }

  async function remove(id: number) {
    if (!confirm('Delete this screening?')) return
    await fetch(`/api/screenings?id=${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <div>
      <button onClick={() => setEditing({ movie_id: movies[0]?.id, event_type: 'film', date: '', time: '', room: 'Secret location', total_seats: 90 })} className="btn-gold mb-6">+ Add Screening</button>
      {editing && (
        <div className="border border-charcoal/10 p-6 mb-8 bg-cream">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={editing.movie_id} onChange={e => setEditing({ ...editing, movie_id: Number(e.target.value) })} className="px-4 py-3 rounded-sm bg-wheat outline-none">
              {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
            <input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input type="time" value={editing.time} onChange={e => setEditing({ ...editing, time: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input placeholder="Room" value={editing.room} onChange={e => setEditing({ ...editing, room: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input placeholder="Total Seats" type="number" value={editing.total_seats} onChange={e => setEditing({ ...editing, total_seats: Number(e.target.value) })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <div className="md:col-span-3 flex gap-3">
              <button onClick={save} className="btn-gold">Save</button>
              <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {screenings.map(s => (
          <div key={s.id} className="border border-charcoal/10 p-4 md:p-5 flex flex-col md:flex-row justify-between gap-4 bg-cream">
            <div>
              <h3 className="font-display text-2xl uppercase">{s.movie_title}</h3>
              <p className="text-stone font-body">{s.date} at {s.time} &mdash; {s.room} &mdash; {s.total_seats} seats</p>
            </div>
            <div className="flex gap-2">
              <a href={`/reserve/${s.id}`} target="_blank" className="px-3 py-1.5 bg-charcoal/5 text-sm hover:bg-charcoal hover:text-cream transition-all duration-300 font-body uppercase tracking-wider">View Seats</a>
              <button onClick={() => setEditing(s)} className="px-3 py-1.5 bg-charcoal/5 text-sm hover:bg-charcoal hover:text-cream transition-all duration-300 font-body uppercase tracking-wider">Edit</button>
              <button onClick={() => remove(s.id)} className="px-3 py-1.5 bg-terra/10 text-terra text-sm hover:bg-terra hover:text-cream transition-all duration-300 font-body uppercase tracking-wider">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EventsTab({ events, refresh }: { events: Event[]; refresh: () => void }) {
  const [editing, setEditing] = useState<Partial<Event> | null>(null)

  async function save() {
    const method = editing?.id ? 'PUT' : 'POST'
    await fetch('/api/events', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    setEditing(null)
    refresh()
  }

  async function remove(id: number) {
    if (!confirm('Delete this event?')) return
    await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <div>
      <button onClick={() => setEditing({ title: '', description: '', date: '', time: '', image: '', type: 'Q&A' })} className="btn-gold mb-6">+ Add Event</button>
      {editing && (
        <div className="border border-charcoal/10 p-6 mb-8 bg-cream">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Title" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input placeholder="Type" value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input type="time" value={editing.time} onChange={e => setEditing({ ...editing, time: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input placeholder="Image URL" value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} className="md:col-span-2 px-4 py-3 rounded-sm bg-wheat outline-none" />
            <textarea placeholder="Description" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="md:col-span-2 px-4 py-3 rounded-sm bg-wheat outline-none" rows={3} />
            <div className="md:col-span-2 flex gap-3">
              <button onClick={save} className="btn-gold">Save</button>
              <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {events.map(e => (
          <div key={e.id} className="border border-charcoal/10 bg-cream p-3">
            <div className="aspect-video relative mb-4 bg-stone/10">
              {e.image && <img src={e.image} alt={e.title} className="w-full h-full object-cover" />}
            </div>
            <span className="text-xs uppercase tracking-wider text-terra font-body">{e.type}</span>
            <h3 className="font-display text-2xl uppercase">{e.title}</h3>
            <p className="text-stone text-sm mb-4 font-body">{e.date} at {e.time}</p>
            <div className="flex gap-2">
              <button onClick={() => setEditing(e)} className="px-3 py-1.5 bg-charcoal/5 text-sm hover:bg-charcoal hover:text-cream transition-all duration-300 font-body uppercase tracking-wider">Edit</button>
              <button onClick={() => remove(e.id)} className="px-3 py-1.5 bg-terra/10 text-terra text-sm hover:bg-terra hover:text-cream transition-all duration-300 font-body uppercase tracking-wider">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GalleryTab({ gallery, refresh }: { gallery: GalleryPhoto[]; refresh: () => void }) {
  const [editing, setEditing] = useState<Partial<GalleryPhoto> | null>(null)

  async function save() {
    const method = editing?.id ? 'PUT' : 'POST'
    await fetch('/api/gallery', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    setEditing(null)
    refresh()
  }

  async function remove(id: number) {
    if (!confirm('Delete this photo?')) return
    await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <div>
      <button onClick={() => setEditing({ image: '', caption: '', date: '' })} className="btn-gold mb-6">+ Add Photo</button>
      {editing && (
        <div className="border border-charcoal/10 p-6 mb-8 bg-cream">
          <div className="grid grid-cols-1 gap-4">
            <input placeholder="Image URL" value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input placeholder="Caption" value={editing.caption} onChange={e => setEditing({ ...editing, caption: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} className="px-4 py-3 rounded-sm bg-wheat outline-none" />
            <div className="flex gap-3">
              <button onClick={save} className="btn-gold">Save</button>
              <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.map(p => (
          <div key={p.id} className="border border-charcoal/10 bg-cream p-2">
            <div className="aspect-square relative bg-stone/10 mb-2">
              {p.image && <img src={p.image} alt={p.caption} className="w-full h-full object-cover" />}
            </div>
            <p className="text-sm font-body truncate">{p.caption}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditing(p)} className="px-2 py-1 bg-charcoal/5 text-xs hover:bg-charcoal hover:text-cream transition-all duration-300 font-body uppercase">Edit</button>
              <button onClick={() => remove(p.id)} className="px-2 py-1 bg-terra/10 text-terra text-xs hover:bg-terra hover:text-cream transition-all duration-300 font-body uppercase">Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReservationsTab({ reservations, refresh }: { reservations: Reservation[]; refresh: () => void }) {
  async function remove(id: number) {
    if (!confirm('Cancel this reservation?')) return
    await fetch(`/api/reservations?id=${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <div className="space-y-4">
      {reservations.map(r => (
        <div key={r.id} className="border border-charcoal/10 p-4 md:p-5 flex flex-col md:flex-row justify-between gap-4 bg-cream">
          <div>
            <h3 className="font-display text-2xl uppercase">{r.movie_title}</h3>
            <p className="text-stone font-body">{r.screening_date} at {r.screening_time} &mdash; {r.seats}</p>
            <p className="text-sm text-charcoal/70 mt-1 font-body">{r.customer_name} / {r.email} / {r.phone}</p>
            <p className="text-gold text-sm font-display text-lg mt-1">{r.confirmation_code}</p>
          </div>
          <div className="flex items-start gap-2">
            <button onClick={() => remove(r.id)} className="px-3 py-1.5 bg-terra/10 text-terra text-sm hover:bg-terra hover:text-cream transition-all duration-300 font-body uppercase tracking-wider">Cancel</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function SeatsTab({ screenings }: { screenings: Screening[] }) {
  const [screeningId, setScreeningId] = useState<number | ''>(screenings[0]?.id || '')
  const [seats, setSeats] = useState<any[]>([])

  async function loadSeats(id: number) {
    const res = await fetch(`/api/screenings/${id}/seats`)
    setSeats(await res.json())
  }

  useEffect(() => {
    if (screeningId) loadSeats(Number(screeningId))
  }, [screeningId])

  async function toggleSeat(seat: any) {
    const newStatus = seat.status === 'reserved' ? 'available' : 'reserved'
    await fetch(`/api/screenings/${screeningId}/seats`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: seat.id, status: newStatus }),
    })
    loadSeats(Number(screeningId))
  }

  const rows = Array.from(new Set(seats.map(s => s.row))).sort()

  return (
    <div>
      <div className="border border-charcoal/10 p-5 mb-8 bg-cream">
        <label className="block text-xs uppercase tracking-[0.2em] text-stone mb-2 font-body">Select Screening</label>
        <select
          value={screeningId}
          onChange={e => setScreeningId(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-sm bg-wheat outline-none"
        >
          {screenings.map(s => (
            <option key={s.id} value={s.id}>{s.movie_title} &mdash; {s.date} {s.time} ({s.room})</option>
          ))}
        </select>
      </div>

      {screeningId && (
        <div className="border border-charcoal/10 p-4 md:p-8 bg-cream">
          <p className="text-xs uppercase tracking-[0.2em] text-stone mb-6 text-center font-body">Click a seat to toggle reserved / available</p>
          <div className="w-3/4 h-1 mx-auto mb-8 bg-charcoal/10" />
          <div className="space-y-3 md:space-y-4">
            {rows.map(row => (
              <div key={row} className="flex items-center justify-center gap-2 md:gap-3">
                <span className="w-5 text-xs font-display text-stone">{row}</span>
                <div className="flex gap-2 md:gap-3">
                  {seats.filter((s: any) => s.row === row).map((seat: any) => (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-sm text-[10px] md:text-xs font-bold transition-all duration-300 ease-fluid ${
                        seat.status === 'reserved'
                          ? 'bg-charcoal/30 text-charcoal/40'
                          : seat.type === 'premium'
                          ? 'bg-transparent border-2 border-gold text-gold'
                          : seat.type === 'wheelchair'
                          ? 'bg-transparent border-2 border-blue-500 text-blue-500'
                          : 'bg-transparent border-2 border-terra text-terra'
                      }`}
                    >
                      {seat.type === 'premium' ? '★' : seat.type === 'wheelchair' ? '♿' : seat.seat_number}
                    </button>
                  ))}
                </div>
                <span className="w-5 text-xs font-display text-stone">{row}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-5 text-[10px] uppercase tracking-wider text-stone font-body">
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm border-2 border-terra" /> Available</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm border-2 border-gold" /> Premium</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm border-2 border-blue-500" /> Wheelchair</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-charcoal/30" /> Reserved</span>
          </div>
        </div>
      )}
    </div>
  )
}
