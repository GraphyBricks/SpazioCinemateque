import db from './db'
import { getPosterPath } from './poster-assets'

export function seed() {
  const movieCount = (db.prepare('SELECT COUNT(*) as c FROM movies').get() as { c: number }).c
  if (movieCount > 0) {
    localizeDemoContent()
    normalizeScreeningCapacity()
    return
  }

  const insertMovie = db.prepare(`
    INSERT INTO movies (title, description, director, genre, poster_url, duration)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const movies = [
    ['Whiplash', 'Un giornalista nella Roma mondana attraversa la dolce vita dell\'elite cittadina nel capolavoro senza tempo di Fellini.', 'Federico Fellini', 'Dramma', getPosterPath('spazio_cinematheque_3814279787728883142.jpg'), 174],
    ['Povere Creature', 'Un\'attrice che ha smesso di parlare e la sua infermiera si ritirano in un cottage sul mare, dove le identita iniziano a confondersi.', 'Ingmar Bergman', 'Dramma psicologico', getPosterPath('spazio_cinematheque_3875095744508073450.jpg'), 85],
    ['Le Città di Pianura', 'Due vicini si avvicinano dopo aver sospettato l\'infedelta dei rispettivi coniugi nella Hong Kong degli anni Sessanta.', 'Wong Kar-wai', 'Romantico', getPosterPath('spazio_cinematheque_3894705721019267185.jpg'), 98],
    ['Chiamami col Tuo Nome', 'Una guida conduce due uomini in una zona proibita e misteriosa alla ricerca di una stanza capace di esaudire i desideri.', 'Andrei Tarkovsky', 'Fantascienza', getPosterPath('spazio_cinematheque_3910744914956148100.jpg'), 162],
  ]

  const movieIds: number[] = []
  for (const m of movies) {
    const result = insertMovie.run(...m)
    movieIds.push(Number(result.lastInsertRowid))
  }

  const insertScreening = db.prepare(`
    INSERT INTO screenings (movie_id, event_type, date, time, room, total_seats)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const today = new Date()
  const screenings = [
    [movieIds[0], 'film', offsetDate(today, 1), '20:30', 'Secret location', 90],
  ]

  const screeningIds: number[] = []
  for (const s of screenings) {
    const result = insertScreening.run(...s)
    screeningIds.push(Number(result.lastInsertRowid))
  }

  const insertSeat = db.prepare(`
    INSERT INTO seats (screening_id, row, seat_number, status, type)
    VALUES (?, ?, ?, ?, ?)
  `)

  for (const screeningId of screeningIds) {
    for (let index = 0; index < 90; index++) {
      const row = String.fromCharCode(65 + Math.floor(index / 10))
      const seatNumber = (index % 10) + 1
      insertSeat.run(screeningId, row, seatNumber, 'available', 'standard')
    }
  }

  // Reserve a few seats for demo realism
  const reservedSeats = db.prepare('SELECT id FROM seats WHERE screening_id = ? LIMIT 8')
  for (const sid of screeningIds.slice(0, 2)) {
    const seats = reservedSeats.all(sid) as { id: number }[]
    db.prepare('UPDATE seats SET status = ? WHERE id = ?').run('reserved', seats[0].id)
    db.prepare('UPDATE seats SET status = ? WHERE id = ?').run('reserved', seats[1].id)
  }

  const insertEvent = db.prepare(`
    INSERT INTO events (title, description, date, time, image, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const events = [
    ['Q&A: Il futuro del cinema d\'essai', 'Registi e programmatori si incontrano per una conversazione intima sul rischio curatoriale nell\'epoca dello streaming.', offsetDate(today, 2), '19:00', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop', 'Q&A'],
    ['Rassegna 70mm: Lawrence of Arabia', 'Una rara presentazione in 70mm dell\'epopea nel deserto di David Lean, introdotta dal nostro head programmer.', offsetDate(today, 5), '18:00', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop', 'Rassegna'],
    ['Panel: donne nel cinema surrealista', 'Studiose e filmmaker discutono i contributi spesso trascurati delle donne al cinema surrealista.', offsetDate(today, 8), '20:00', 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&auto=format&fit=crop', 'Panel'],
    ['Notte di mezzanotte: Suspiria', 'Una proiezione sensoriale del technicolor incubo di Argento con introduzione musicale dal vivo.', offsetDate(today, 4), '23:59', 'https://images.unsplash.com/photo-1509347528160-9a9e33742cd4?w=800&auto=format&fit=crop', 'Notte al cinema'],
  ]

  for (const e of events) insertEvent.run(...e)

  const insertGallery = db.prepare(`
    INSERT INTO gallery_photos (image, caption, date)
    VALUES (?, ?, ?)
  `)

  const gallery = [
    ['https://images.unsplash.com/photo-1517604931442-710e8ed05b54?w=800&auto=format&fit=crop', 'Pubblico della serata inaugurale', offsetDate(today, -30)],
    ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop', 'Dettaglio della cabina di proiezione', offsetDate(today, -25)],
    ['https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop', 'Posti vuoti in SALA 1', offsetDate(today, -20)],
    ['https://images.unsplash.com/photo-1594909122849-11e29194f11c?w=800&auto=format&fit=crop', 'Conversazioni nel foyer', offsetDate(today, -15)],
    ['https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop', 'Introduzione del filmmaker', offsetDate(today, -10)],
    ['https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&auto=format&fit=crop', 'Zona bar', offsetDate(today, -5)],
  ]

  for (const g of gallery) insertGallery.run(...g)
}

function offsetDate(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function normalizeScreeningCapacity() {
  const screenings = db.prepare('SELECT id FROM screenings').all() as { id: number }[]
  const existingQuery = db.prepare('SELECT row, seat_number FROM seats WHERE screening_id = ?')
  const insertSeat = db.prepare('INSERT INTO seats (screening_id, row, seat_number, status, type) VALUES (?, ?, ?, ?, ?)')
  const updateCapacity = db.prepare('UPDATE screenings SET total_seats = 90, room = ? WHERE id = ?')

  for (const screening of screenings) {
    updateCapacity.run('Secret location', screening.id)
    const existingSeats = existingQuery.all(screening.id) as { row: string; seat_number: number }[]
    const existing = new Set(existingSeats.map((seat) => seat.row + '-' + seat.seat_number))
    for (let index = 0; index < 90; index++) {
      const row = String.fromCharCode(65 + Math.floor(index / 10))
      const seatNumber = (index % 10) + 1
      if (!existing.has(row + '-' + seatNumber)) {
        insertSeat.run(screening.id, row, seatNumber, 'available', 'standard')
      }
    }
  }
}

function localizeDemoContent() {
  const movieUpdates = [
    {
      currentTitles: ['La Dolce Vita'],
      nextTitle: 'Whiplash',
      nextPosterUrl: getPosterPath('spazio_cinematheque_3814279787728883142.jpg'),
    },
    {
      currentTitles: ['Persona'],
      nextTitle: 'Povere Creature',
      nextPosterUrl: getPosterPath('spazio_cinematheque_3875095744508073450.jpg'),
    },
    {
      currentTitles: ['In the Mood for Love'],
      nextTitle: 'Le Città di Pianura',
      nextPosterUrl: getPosterPath('spazio_cinematheque_3894705721019267185.jpg'),
    },
    {
      currentTitles: ['Stalker'],
      nextTitle: 'Chiamami col Tuo Nome',
      nextPosterUrl: getPosterPath('spazio_cinematheque_3910744914956148100.jpg'),
    },
  ]

  const updateMovie = db.prepare(`
    UPDATE movies
    SET title = ?, poster_url = ?
    WHERE title = ?
  `)

  for (const movie of movieUpdates) {
    for (const currentTitle of movie.currentTitles) {
      updateMovie.run(
        movie.nextTitle,
        movie.nextPosterUrl,
        currentTitle,
      )
    }
  }

  // Remove the two movies that no longer have matching local posters.
  const removedMovieTitles = ['Il Padrino', 'The Godfather', 'Parasite']
  const placeholders = removedMovieTitles.map(() => '?').join(', ')
  db.prepare(`DELETE FROM movies WHERE title IN (${placeholders})`).run(...removedMovieTitles)

  const eventUpdates = [
    {
      currentTitle: 'Q&A: The Future of Art-House Cinema',
      currentDescription: 'Join directors and programmers for an intimate conversation on programming risk in the streaming era.',
      nextTitle: 'Q&A: Il futuro del cinema d\'essai',
      nextDescription: 'Registi e programmatori si incontrano per una conversazione intima sul rischio curatoriale nell\'epoca dello streaming.',
      nextType: 'Q&A',
    },
    {
      currentTitle: '70mm Showcase: Lawrence of Arabia',
      currentDescription: 'A rare 70mm presentation of David Lean\'s desert epic with an introduction by our head programmer.',
      nextTitle: 'Rassegna 70mm: Lawrence of Arabia',
      nextDescription: 'Una rara presentazione in 70mm dell\'epopea nel deserto di David Lean, introdotta dal nostro head programmer.',
      nextType: 'Rassegna',
    },
    {
      currentTitle: 'Women in Surrealist Cinema Panel',
      currentDescription: 'Scholars and filmmakers discuss the overlooked contributions of women to surrealist film.',
      nextTitle: 'Panel: donne nel cinema surrealista',
      nextDescription: 'Studiose e filmmaker discutono i contributi spesso trascurati delle donne al cinema surrealista.',
      nextType: 'Panel',
    },
    {
      currentTitle: 'Midnight Film Night: Suspiria',
      currentDescription: 'A sensory overload screening of Argento\'s technicolor nightmare with live soundtrack intro.',
      nextTitle: 'Notte di mezzanotte: Suspiria',
      nextDescription: 'Una proiezione sensoriale del technicolor incubo di Argento con introduzione musicale dal vivo.',
      nextType: 'Notte al cinema',
    },
  ]

  const updateEvent = db.prepare(`
    UPDATE events
    SET title = ?, description = ?, type = ?
    WHERE title = ? AND description = ?
  `)

  for (const event of eventUpdates) {
    updateEvent.run(
      event.nextTitle,
      event.nextDescription,
      event.nextType,
      event.currentTitle,
      event.currentDescription,
    )
  }

  const galleryUpdates = [
    ['Pubblico della serata inaugurale', 'Opening night crowd'],
    ['Dettaglio della cabina di proiezione', 'Projection booth detail'],
    ['Posti vuoti in SALA 1', 'SALA 1 seats empty'],
    ['Conversazioni nel foyer', 'Lobby conversations'],
    ['Introduzione del filmmaker', 'Filmmaker introduction'],
    ['Zona bar', 'Bar area'],
  ]

  const updateGallery = db.prepare('UPDATE gallery_photos SET caption = ? WHERE caption = ?')
  for (const [nextCaption, currentCaption] of galleryUpdates) {
    updateGallery.run(nextCaption, currentCaption)
  }
}
