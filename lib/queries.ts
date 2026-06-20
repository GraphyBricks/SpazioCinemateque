import db from './db'
import { ensureDb } from './init'

ensureDb()

export type Movie = {
  id: number
  title: string
  description: string
  director: string
  genre: string
  poster_url: string
  maps_url: string | null
  duration: number
  created_at: string
}

export type Screening = {
  id: number
  movie_id: number
  event_type: string
  date: string
  time: string
  room: string
  total_seats: number
  created_at: string
  movie_title?: string
  movie_genre?: string
  movie_poster_url?: string
  movie_duration?: number
  movie_description?: string
  movie_director?: string
}

export type Seat = {
  id: number
  screening_id: number
  row: string
  seat_number: number
  status: 'available' | 'reserved' | 'selected'
  type: 'standard' | 'premium' | 'wheelchair'
}

export type Reservation = {
  id: number
  screening_id: number
  customer_name: string
  email: string
  phone: string
  confirmation_code: string
  status: string
  created_at: string
  seats?: string
  movie_title?: string
  screening_date?: string
  screening_time?: string
}

export type Event = {
  id: number
  title: string
  description: string
  date: string
  time: string
  image: string
  type: string
  created_at: string
}

export type GalleryPhoto = {
  id: number
  image: string
  caption: string
  date: string
  created_at: string
}

export function getMovies(): Movie[] {
  return db.prepare('SELECT * FROM movies ORDER BY created_at DESC').all() as Movie[]
}

export function getMovieById(id: number): Movie | undefined {
  return db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as Movie | undefined
}

export function createMovie(movie: Omit<Movie, 'id' | 'created_at'>) {
  return db.prepare(`
    INSERT INTO movies (title, description, director, genre, poster_url, maps_url, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(movie.title, movie.description, movie.director, movie.genre, movie.poster_url, movie.maps_url || null, movie.duration)
}

export function updateMovie(id: number, movie: Partial<Movie>) {
  const allowed = ['title', 'description', 'director', 'genre', 'poster_url', 'maps_url', 'duration']
  const fields = Object.keys(movie).filter(k => allowed.includes(k))
  if (fields.length === 0) return
  const set = fields.map(f => `${f} = ?`).join(', ')
  const values = fields.map(f => (movie as any)[f])
  db.prepare(`UPDATE movies SET ${set} WHERE id = ?`).run(...values, id)
}

export function deleteMovie(id: number) {
  db.prepare('DELETE FROM movies WHERE id = ?').run(id)
}

export function getScreenings(): Screening[] {
  return db.prepare(`
    SELECT s.*, m.title as movie_title, m.genre as movie_genre, m.poster_url as movie_poster_url,
           m.duration as movie_duration, m.description as movie_description, m.director as movie_director
    FROM screenings s
    JOIN movies m ON s.movie_id = m.id
    ORDER BY s.date, s.time
  `).all() as Screening[]
}

export function getFeaturedScreening(): Screening | undefined {
  const screenings = getScreenings()
  if (screenings.length === 0) return undefined

  const now = new Date()
  const localDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
  const localTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return screenings.find((screening) => (
    screening.date > localDate || (screening.date === localDate && screening.time >= localTime)
  )) ?? screenings[screenings.length - 1]
}

export function getScreeningById(id: number): Screening | undefined {
  return db.prepare(`
    SELECT s.*, m.title as movie_title, m.genre as movie_genre, m.poster_url as movie_poster_url,
           m.duration as movie_duration, m.description as movie_description, m.director as movie_director
    FROM screenings s
    JOIN movies m ON s.movie_id = m.id
    WHERE s.id = ?
  `).get(id) as Screening | undefined
}

export function getMovieMapsUrlForScreening(screeningId: number): string | null {
  const result = db.prepare(`
    SELECT m.maps_url
    FROM screenings s
    JOIN movies m ON s.movie_id = m.id
    WHERE s.id = ?
  `).get(screeningId) as { maps_url: string | null } | undefined

  return result?.maps_url || null
}

export function getScreeningsByMovie(movieId: number): Screening[] {
  return db.prepare(`
    SELECT s.*, m.title as movie_title
    FROM screenings s
    JOIN movies m ON s.movie_id = m.id
    WHERE s.movie_id = ?
    ORDER BY s.date, s.time
  `).all(movieId) as Screening[]
}

export function createScreening(screening: Omit<Screening, 'id' | 'created_at' | 'movie_title' | 'movie_genre' | 'movie_poster_url' | 'movie_duration'>) {
  const result = db.prepare(`
    INSERT INTO screenings (movie_id, event_type, date, time, room, total_seats)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(screening.movie_id, screening.event_type, screening.date, screening.time, screening.room, screening.total_seats)
  generateSeats(Number(result.lastInsertRowid), screening.total_seats)
  return result
}

export function updateScreening(id: number, screening: Partial<Screening>) {
  const allowed = ['movie_id', 'event_type', 'date', 'time', 'room', 'total_seats']
  const fields = Object.keys(screening).filter(k => allowed.includes(k))
  if (fields.length === 0) return
  const set = fields.map(f => `${f} = ?`).join(', ')
  const values = fields.map(f => (screening as any)[f])
  db.prepare(`UPDATE screenings SET ${set} WHERE id = ?`).run(...values, id)
}

export function deleteScreening(id: number) {
  db.prepare('DELETE FROM screenings WHERE id = ?').run(id)
}

export function generateSeats(screeningId: number, totalSeats = 90) {
  const existingSeats = db.prepare('SELECT row, seat_number FROM seats WHERE screening_id = ?').all(screeningId) as Pick<Seat, 'row' | 'seat_number'>[]
  if (existingSeats.length >= totalSeats) return
  const existing = new Set(existingSeats.map((seat) => seat.row + '-' + seat.seat_number))
  const insert = db.prepare('INSERT INTO seats (screening_id, row, seat_number, status, type) VALUES (?, ?, ?, ?, ?)')
  for (let index = 0; index < totalSeats; index++) {
    const row = String.fromCharCode(65 + Math.floor(index / 10))
    const seatNumber = (index % 10) + 1
    if (!existing.has(row + '-' + seatNumber)) {
      insert.run(screeningId, row, seatNumber, 'available', 'standard')
    }
  }
}

export function getSeatsByScreening(screeningId: number): Seat[] {
  return db.prepare('SELECT * FROM seats WHERE screening_id = ? ORDER BY row, seat_number').all(screeningId) as Seat[]
}

export function updateSeatStatus(seatId: number, status: string) {
  db.prepare('UPDATE seats SET status = ? WHERE id = ?').run(status, seatId)
}

export function getEvents(): Event[] {
  return db.prepare('SELECT * FROM events ORDER BY date, time').all() as Event[]
}

export function getEventById(id: number): Event | undefined {
  return db.prepare('SELECT * FROM events WHERE id = ?').get(id) as Event | undefined
}

export function createEvent(event: Omit<Event, 'id' | 'created_at'>) {
  return db.prepare(`
    INSERT INTO events (title, description, date, time, image, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(event.title, event.description, event.date, event.time, event.image, event.type)
}

export function updateEvent(id: number, event: Partial<Event>) {
  const fields = Object.keys(event).filter(k => k !== 'id' && k !== 'created_at')
  if (fields.length === 0) return
  const set = fields.map(f => `${f} = ?`).join(', ')
  const values = fields.map(f => (event as any)[f])
  db.prepare(`UPDATE events SET ${set} WHERE id = ?`).run(...values, id)
}

export function deleteEvent(id: number) {
  db.prepare('DELETE FROM events WHERE id = ?').run(id)
}

export function getGalleryPhotos(): GalleryPhoto[] {
  return db.prepare('SELECT * FROM gallery_photos ORDER BY created_at DESC').all() as GalleryPhoto[]
}

export function createGalleryPhoto(photo: Omit<GalleryPhoto, 'id' | 'created_at'>) {
  return db.prepare('INSERT INTO gallery_photos (image, caption, date) VALUES (?, ?, ?)').run(photo.image, photo.caption, photo.date)
}

export function updateGalleryPhoto(id: number, photo: Partial<GalleryPhoto>) {
  const fields = Object.keys(photo).filter(k => k !== 'id' && k !== 'created_at')
  if (fields.length === 0) return
  const set = fields.map(f => `${f} = ?`).join(', ')
  const values = fields.map(f => (photo as any)[f])
  db.prepare(`UPDATE gallery_photos SET ${set} WHERE id = ?`).run(...values, id)
}

export function deleteGalleryPhoto(id: number) {
  db.prepare('DELETE FROM gallery_photos WHERE id = ?').run(id)
}

export function getReservations(): Reservation[] {
  return db.prepare(`
    SELECT r.*, m.title as movie_title, s.date as screening_date, s.time as screening_time,
           GROUP_CONCAT(st.row || st.seat_number, ', ') as seats
    FROM reservations r
    JOIN screenings s ON r.screening_id = s.id
    JOIN movies m ON s.movie_id = m.id
    LEFT JOIN reservation_seats rs ON r.id = rs.reservation_id
    LEFT JOIN seats st ON rs.seat_id = st.id
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `).all() as Reservation[]
}

export function getReservationsByScreening(screeningId: number): Reservation[] {
  return db.prepare(`
    SELECT r.*, GROUP_CONCAT(st.row || st.seat_number, ', ') as seats
    FROM reservations r
    LEFT JOIN reservation_seats rs ON r.id = rs.reservation_id
    LEFT JOIN seats st ON rs.seat_id = st.id
    WHERE r.screening_id = ?
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `).all(screeningId) as Reservation[]
}

export function createReservation(reservation: Omit<Reservation, 'id' | 'created_at' | 'seats' | 'movie_title' | 'screening_date' | 'screening_time'>, seatIds: number[]) {
  if (seatIds.length === 0) throw new Error('No places requested')

  return db.transaction(() => {
    const placeholders = seatIds.map(() => '?').join(', ')
    const available = (db.prepare(
      'SELECT COUNT(*) as count FROM seats WHERE id IN (' + placeholders + ") AND screening_id = ? AND status = 'available'"
    ).get(...seatIds, reservation.screening_id) as { count: number }).count

    if (available !== seatIds.length) throw new Error('Places are no longer available')

    const result = db.prepare(
      'INSERT INTO reservations (screening_id, customer_name, email, phone, confirmation_code, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(reservation.screening_id, reservation.customer_name, reservation.email, reservation.phone, reservation.confirmation_code, reservation.status)
    const reservationId = Number(result.lastInsertRowid)
    const insertSeat = db.prepare('INSERT INTO reservation_seats (reservation_id, seat_id) VALUES (?, ?)')
    const updateSeat = db.prepare("UPDATE seats SET status = 'reserved' WHERE id = ?")
    for (const seatId of seatIds) {
      insertSeat.run(reservationId, seatId)
      updateSeat.run(seatId)
    }
    return result
  })()
}

export function updateReservationStatus(id: number, status: string) {
  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, id)
}

export function deleteReservation(id: number) {
  const seatIds = (db.prepare('SELECT seat_id FROM reservation_seats WHERE reservation_id = ?').all(id) as { seat_id: number }[]).map(r => r.seat_id)
  for (const sid of seatIds) {
    db.prepare("UPDATE seats SET status = 'available' WHERE id = ?").run(sid)
  }
  db.prepare('DELETE FROM reservation_seats WHERE reservation_id = ?').run(id)
  db.prepare('DELETE FROM reservations WHERE id = ?').run(id)
}

export function generateConfirmationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'SC-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}
