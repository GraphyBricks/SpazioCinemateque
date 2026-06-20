import type { PoolClient } from 'pg'
import db, { query, withTransaction } from './db'
import { ensureDb } from './init'

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

async function ready() {
  await ensureDb()
}

export async function getMovies(): Promise<Movie[]> {
  await ready()
  return query<Movie>('SELECT id, title, description, director, genre, poster_url, maps_url, duration, created_at::text AS created_at FROM movies ORDER BY created_at DESC')
}

export async function getMovieById(id: number): Promise<Movie | undefined> {
  await ready()
  const rows = await query<Movie>('SELECT id, title, description, director, genre, poster_url, maps_url, duration, created_at::text AS created_at FROM movies WHERE id = $1', [id])
  return rows[0]
}

export async function createMovie(movie: Omit<Movie, 'id' | 'created_at'>) {
  await ready()
  await db.query(
    'INSERT INTO movies (title, description, director, genre, poster_url, maps_url, duration) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [movie.title, movie.description, movie.director, movie.genre, movie.poster_url, movie.maps_url || null, movie.duration]
  )
}

export async function updateMovie(id: number, movie: Partial<Movie>) {
  await ready()
  const allowed = ['title', 'description', 'director', 'genre', 'poster_url', 'maps_url', 'duration']
  const fields = Object.keys(movie).filter((key) => allowed.includes(key))
  if (fields.length === 0) return
  const set = fields.map((field, index) => `${field} = $${index + 1}`).join(', ')
  const values = fields.map((field) => movie[field as keyof Movie] ?? null)
  await db.query(`UPDATE movies SET ${set} WHERE id = $${fields.length + 1}`, [...values, id])
}

export async function deleteMovie(id: number) {
  await ready()
  await db.query('DELETE FROM movies WHERE id = $1', [id])
}

const screeningSelect = `
  SELECT s.id, s.movie_id, s.event_type, s.date, s.time, s.room, s.total_seats,
         s.created_at::text AS created_at,
         m.title AS movie_title, m.genre AS movie_genre, m.poster_url AS movie_poster_url,
         m.duration AS movie_duration, m.description AS movie_description, m.director AS movie_director
  FROM screenings s
  JOIN movies m ON s.movie_id = m.id
`

export async function getScreenings(): Promise<Screening[]> {
  await ready()
  return query<Screening>(screeningSelect + ' ORDER BY s.date, s.time')
}

export async function getFeaturedScreening(): Promise<Screening | undefined> {
  const screenings = await getScreenings()
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

export async function getScreeningById(id: number): Promise<Screening | undefined> {
  await ready()
  const rows = await query<Screening>(screeningSelect + ' WHERE s.id = $1', [id])
  return rows[0]
}

export async function getMovieMapsUrlForScreening(screeningId: number): Promise<string | null> {
  await ready()
  const rows = await query<{ maps_url: string | null }>(
    'SELECT m.maps_url FROM screenings s JOIN movies m ON s.movie_id = m.id WHERE s.id = $1',
    [screeningId]
  )
  return rows[0]?.maps_url || null
}

export async function getScreeningsByMovie(movieId: number): Promise<Screening[]> {
  await ready()
  return query<Screening>(screeningSelect + ' WHERE s.movie_id = $1 ORDER BY s.date, s.time', [movieId])
}

export async function createScreening(screening: Omit<Screening, 'id' | 'created_at' | 'movie_title' | 'movie_genre' | 'movie_poster_url' | 'movie_duration' | 'movie_description' | 'movie_director'>) {
  await ready()
  return withTransaction(async (client) => {
    const result = await client.query<{ id: number }>(
      'INSERT INTO screenings (movie_id, event_type, date, time, room, total_seats) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [screening.movie_id, screening.event_type, screening.date, screening.time, screening.room, screening.total_seats]
    )
    const id = result.rows[0].id
    await generateSeats(id, screening.total_seats, client)
    return id
  })
}

export async function updateScreening(id: number, screening: Partial<Screening>) {
  await ready()
  const allowed = ['movie_id', 'event_type', 'date', 'time', 'room', 'total_seats']
  const fields = Object.keys(screening).filter((key) => allowed.includes(key))
  if (fields.length === 0) return
  const set = fields.map((field, index) => `${field} = $${index + 1}`).join(', ')
  const values = fields.map((field) => screening[field as keyof Screening] ?? null)
  await db.query(`UPDATE screenings SET ${set} WHERE id = $${fields.length + 1}`, [...values, id])
  if (screening.total_seats) await generateSeats(id, screening.total_seats)
}

export async function deleteScreening(id: number) {
  await ready()
  await db.query('DELETE FROM screenings WHERE id = $1', [id])
}

export async function generateSeats(screeningId: number, totalSeats = 90, client?: PoolClient) {
  await ready()
  const executor = client ?? db
  await executor.query(`
    INSERT INTO seats (screening_id, row, seat_number, status, type)
    SELECT $1, chr(65 + (slot / 10)::integer), (slot % 10) + 1, 'available', 'standard'
    FROM generate_series(0, $2::integer - 1) AS slot
    ON CONFLICT (screening_id, row, seat_number) DO NOTHING
  `, [screeningId, totalSeats])
}

export async function getSeatsByScreening(screeningId: number): Promise<Seat[]> {
  await ready()
  return query<Seat>('SELECT id, screening_id, row, seat_number, status, type FROM seats WHERE screening_id = $1 ORDER BY row, seat_number', [screeningId])
}

export async function updateSeatStatus(seatId: number, status: string) {
  await ready()
  await db.query('UPDATE seats SET status = $1 WHERE id = $2', [status, seatId])
}

export async function getEvents(): Promise<Event[]> {
  await ready()
  return query<Event>('SELECT id, title, description, date, time, image, type, created_at::text AS created_at FROM events ORDER BY date, time')
}

export async function getEventById(id: number): Promise<Event | undefined> {
  await ready()
  const rows = await query<Event>('SELECT id, title, description, date, time, image, type, created_at::text AS created_at FROM events WHERE id = $1', [id])
  return rows[0]
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at'>) {
  await ready()
  await db.query(
    'INSERT INTO events (title, description, date, time, image, type) VALUES ($1, $2, $3, $4, $5, $6)',
    [event.title, event.description, event.date, event.time, event.image, event.type]
  )
}

export async function updateEvent(id: number, event: Partial<Event>) {
  await ready()
  const allowed = ['title', 'description', 'date', 'time', 'image', 'type']
  const fields = Object.keys(event).filter((key) => allowed.includes(key))
  if (fields.length === 0) return
  const set = fields.map((field, index) => `${field} = $${index + 1}`).join(', ')
  const values = fields.map((field) => event[field as keyof Event] ?? null)
  await db.query(`UPDATE events SET ${set} WHERE id = $${fields.length + 1}`, [...values, id])
}

export async function deleteEvent(id: number) {
  await ready()
  await db.query('DELETE FROM events WHERE id = $1', [id])
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  await ready()
  return query<GalleryPhoto>('SELECT id, image, caption, date, created_at::text AS created_at FROM gallery_photos ORDER BY created_at DESC')
}

export async function createGalleryPhoto(photo: Omit<GalleryPhoto, 'id' | 'created_at'>) {
  await ready()
  await db.query('INSERT INTO gallery_photos (image, caption, date) VALUES ($1, $2, $3)', [photo.image, photo.caption, photo.date])
}

export async function updateGalleryPhoto(id: number, photo: Partial<GalleryPhoto>) {
  await ready()
  const allowed = ['image', 'caption', 'date']
  const fields = Object.keys(photo).filter((key) => allowed.includes(key))
  if (fields.length === 0) return
  const set = fields.map((field, index) => `${field} = $${index + 1}`).join(', ')
  const values = fields.map((field) => photo[field as keyof GalleryPhoto] ?? null)
  await db.query(`UPDATE gallery_photos SET ${set} WHERE id = $${fields.length + 1}`, [...values, id])
}

export async function deleteGalleryPhoto(id: number) {
  await ready()
  await db.query('DELETE FROM gallery_photos WHERE id = $1', [id])
}

export async function getReservations(): Promise<Reservation[]> {
  await ready()
  return query<Reservation>(`
    SELECT r.id, r.screening_id, r.customer_name, r.email, r.phone, r.confirmation_code,
           r.status, r.created_at::text AS created_at, m.title AS movie_title,
           s.date AS screening_date, s.time AS screening_time,
           string_agg(st.row || st.seat_number::text, ', ' ORDER BY st.row, st.seat_number) AS seats
    FROM reservations r
    JOIN screenings s ON r.screening_id = s.id
    JOIN movies m ON s.movie_id = m.id
    LEFT JOIN reservation_seats rs ON r.id = rs.reservation_id
    LEFT JOIN seats st ON rs.seat_id = st.id
    GROUP BY r.id, m.title, s.date, s.time
    ORDER BY r.created_at DESC
  `)
}

export async function getReservationsByScreening(screeningId: number): Promise<Reservation[]> {
  await ready()
  return query<Reservation>(`
    SELECT r.id, r.screening_id, r.customer_name, r.email, r.phone, r.confirmation_code,
           r.status, r.created_at::text AS created_at,
           string_agg(st.row || st.seat_number::text, ', ' ORDER BY st.row, st.seat_number) AS seats
    FROM reservations r
    LEFT JOIN reservation_seats rs ON r.id = rs.reservation_id
    LEFT JOIN seats st ON rs.seat_id = st.id
    WHERE r.screening_id = $1
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `, [screeningId])
}

export async function createReservation(
  reservation: Omit<Reservation, 'id' | 'created_at' | 'seats' | 'movie_title' | 'screening_date' | 'screening_time'>,
  seatIds: number[]
) {
  await ready()
  const uniqueSeatIds = Array.from(new Set(seatIds))
  if (uniqueSeatIds.length === 0) throw new Error('No places requested')

  return withTransaction(async (client) => {
    const locked = await client.query<{ id: number }>(`
      SELECT id
      FROM seats
      WHERE id = ANY($1::integer[]) AND screening_id = $2 AND status = 'available'
      FOR UPDATE
    `, [uniqueSeatIds, reservation.screening_id])

    if (locked.rowCount !== uniqueSeatIds.length) {
      throw new Error('Places are no longer available')
    }

    const created = await client.query<{ id: number }>(`
      INSERT INTO reservations (screening_id, customer_name, email, phone, confirmation_code, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      reservation.screening_id,
      reservation.customer_name,
      reservation.email,
      reservation.phone || null,
      reservation.confirmation_code,
      reservation.status,
    ])

    const reservationId = created.rows[0].id
    await client.query(
      'INSERT INTO reservation_seats (reservation_id, seat_id) SELECT $1, unnest($2::integer[])',
      [reservationId, uniqueSeatIds]
    )
    await client.query("UPDATE seats SET status = 'reserved' WHERE id = ANY($1::integer[])", [uniqueSeatIds])
    return reservationId
  })
}

export async function updateReservationStatus(id: number, status: string) {
  await ready()
  await db.query('UPDATE reservations SET status = $1 WHERE id = $2', [status, id])
}

export async function deleteReservation(id: number) {
  await ready()
  await withTransaction(async (client) => {
    const result = await client.query<{ seat_id: number }>('SELECT seat_id FROM reservation_seats WHERE reservation_id = $1 FOR UPDATE', [id])
    const seatIds = result.rows.map((row) => row.seat_id)
    if (seatIds.length > 0) {
      await client.query("UPDATE seats SET status = 'available' WHERE id = ANY($1::integer[])", [seatIds])
    }
    await client.query('DELETE FROM reservations WHERE id = $1', [id])
  })
}

export function generateConfirmationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'SC-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}
