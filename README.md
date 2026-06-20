# Spazio Cinematheque

A mobile-first website and reservation platform for **Spazio Cinematheque**, a shared film project based in Nola.

## Features

- **Public site**: Home, next screening, gallery, project information, and contact
- **Reservation flow**: group size, guest details, confirmation code, and private Google Maps location
- **Admin dashboard**: manage Movies, Screenings, Events, Gallery, and Reservations
- **Neon PostgreSQL database** with transactional reservations

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL via `pg`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The application requires `DATABASE_URL` in `.env.local` and in the deployment environment.

## Database Migration

The one-time migration utility copies the legacy local SQLite data into an empty Neon database:

```bash
npm run db:migrate
```

It uses `DATABASE_URL_UNPOOLED` when available and stops without changing Neon if application data already exists.

## Admin Access

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) and log in with:

- **Password**: `spazio2024`

You can change the password via the `ADMIN_PASSWORD` environment variable.

## Secret Location

Add the private Google Maps URL while creating or editing a movie in the admin panel. It is stored with that movie and shown to guests only after a reservation is successfully created.

## Project Structure

- `app/` — Next.js App Router pages and API routes
- `components/` — React components (navigation, seat map, admin dashboard, etc.)
- `lib/` — PostgreSQL database layer, queries, and auth helpers
- `scripts/` — One-time SQLite-to-Neon migration
- `data/` — Legacy SQLite migration source and local backups (ignored by git)

## Notes

- No payment integration is included; reservations capture contact details only.
- Images use Unsplash URLs for demo purposes.
- Database schema changes should be applied through explicit migration scripts.
