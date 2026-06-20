# Spazio Cinematheque

A mobile-first website and reservation platform for **Spazio Cinematheque**, a shared film project based in Nola.

## Features

- **Public site**: Home, next screening, gallery, project information, and contact
- **Reservation flow**: group size, guest details, confirmation code, and private Google Maps location
- **Admin dashboard**: manage Movies, Screenings, Events, Gallery, and Reservations
- **SQLite database** with seed data for demo

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- better-sqlite3

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin Access

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) and log in with:

- **Password**: `spazio2024`

You can change the password via the `ADMIN_PASSWORD` environment variable.

## Secret Location

Add the private Google Maps URL while creating or editing a movie in the admin panel. It is stored with that movie and shown to guests only after a reservation is successfully created.

## Project Structure

- `app/` — Next.js App Router pages and API routes
- `components/` — React components (navigation, seat map, admin dashboard, etc.)
- `lib/` — Database layer, queries, seed data, auth helpers
- `data/` — SQLite database files (ignored by git)

## Notes

- No payment integration is included; reservations capture contact details only.
- Images use Unsplash URLs for demo purposes.
- The database is seeded automatically on first run.
