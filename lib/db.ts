import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = join(process.cwd(), 'data', 'spazio.db')
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      director TEXT,
      genre TEXT,
      poster_url TEXT,
      maps_url TEXT,
      duration INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      image TEXT,
      type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS screenings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      event_type TEXT NOT NULL DEFAULT 'film',
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      room TEXT NOT NULL,
      total_seats INTEGER NOT NULL DEFAULT 90,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      screening_id INTEGER NOT NULL,
      row TEXT NOT NULL,
      seat_number INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      type TEXT NOT NULL DEFAULT 'standard',
      FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      screening_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      confirmation_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reservation_seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER NOT NULL,
      seat_id INTEGER NOT NULL,
      FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
      FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gallery_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT NOT NULL,
      caption TEXT,
      date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  const movieColumns = db.prepare('PRAGMA table_info(movies)').all() as { name: string }[]
  if (!movieColumns.some((column) => column.name === 'maps_url')) {
    try {
      db.exec('ALTER TABLE movies ADD COLUMN maps_url TEXT')
    } catch (error) {
      const migratedColumns = db.prepare('PRAGMA table_info(movies)').all() as { name: string }[]
      if (!migratedColumns.some((column) => column.name === 'maps_url')) throw error
    }
  }
}

export default db
