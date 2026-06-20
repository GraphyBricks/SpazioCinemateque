# Spazio Cinematheque — Agent Guide

This file is written for AI coding agents. It describes the project architecture, conventions, and commands as they actually exist in the codebase.

## Project Overview

Spazio Cinematheque is a Next.js 14 website and reservation platform for an independent cultural cinema. It combines a public-facing site (home, schedule, events, gallery, about, contact) with a password-protected admin dashboard and an interactive seat-reservation flow.

Key facts:

- The site is server-rendered with the Next.js App Router.
- Data is stored in Neon PostgreSQL and accessed through `pg`.
- The legacy SQLite file under `data/` is retained only as a migration source/local backup.
- There is no payment integration; reservations only capture contact details and seat selections.
- Demo images come from Unsplash URLs and from a small set of local files in `assets/images`.
- All public-facing text and content are displayed in Italian.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14.2.4 (App Router) |
| Runtime | Node.js (tested with v22) |
| Language | TypeScript 5.5.2 (strict mode) |
| Styling | Tailwind CSS 3.4.4 + custom CSS in `app/globals.css` |
| Database | Neon PostgreSQL via `pg` |
| Icons | `@phosphor-icons/react` 2.1.6 |
| Fonts | Google Fonts loaded via `next/font/google`: Bebas Neue, Plus Jakarta Sans, Cormorant Garamond |

## Project Structure

```
app/                  Next.js App Router pages and API routes
  about/page.tsx
  admin/page.tsx
  admin/login/page.tsx
  api/                  Route handlers (REST-ish JSON endpoints)
  contact/page.tsx
  events/page.tsx
  gallery/page.tsx
  reserve/page.tsx
  reserve/[id]/page.tsx
  schedule/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/           React components shared across pages
  admin-dashboard.tsx
  editorial-image.tsx
  footer.tsx
  gallery-film-strip.tsx
  navigation.tsx
  reservation-flow.tsx
  seat-map.tsx
  section-number.tsx
  section-reveal.tsx
lib/                  PostgreSQL database layer, queries, auth helpers
  admin-auth.ts
  db.ts
  gallery-assets.ts
  init.ts
  queries.ts
scripts/              One-time SQLite-to-Neon migration
data/                 Legacy SQLite migration source (gitignored)
assets/images/        Local gallery and poster images
public/images/        Static public assets (currently empty)
```

## Build and Development Commands

From `package.json`:

```bash
npm install       # Install dependencies
npm run dev       # Start the Next.js dev server on http://localhost:3000
npm run build     # Production build
npm start         # Start the production server
npm run lint      # Run Next.js ESLint
npm run db:migrate # One-time copy from local SQLite to an empty Neon database
```

There are no test scripts, test files, or testing framework configured.

## Runtime Architecture

### Database Initialization

- `lib/db.ts` creates a pooled PostgreSQL connection from `DATABASE_URL`.
- `lib/init.ts` verifies connectivity once per process.
- `ensureDb()` is awaited in the root layout and by query functions.
- Schema/data initialization is explicit through `npm run db:migrate` rather than runtime seeding.

### Schema

The database contains these tables:

- `movies` — film metadata, poster URL, duration, genre, director.
- `screenings` — scheduled showings linked to a movie.
- `seats` — per-screening seat map (row, number, status, type: standard/premium/wheelchair).
- `reservations` — customer bookings with a generated confirmation code.
- `reservation_seats` — many-to-many link between reservations and seats.
- `events` — special programming (panels, Q&As, showcases).
- `gallery_photos` — gallery images stored as URLs/captions.

Seat capacity defaults to 90 internal availability records. Public reservations select a guest count rather than assigned seats.

### Rendering Strategy

- Most page components are `async` Server Components and export `dynamic = 'force-dynamic'`.
- Client Components are marked with `'use client'` and are used for interactive UI: navigation, reservation flow, admin dashboard, contact form, seat map, and scroll reveal.
- Path alias `@/*` maps to the project root.

### Admin Authentication

- The admin area is at `/admin`.
- `lib/admin-auth.ts` checks for a cookie named `spazio_admin_session` with value `authenticated`; otherwise it redirects to `/admin/login`.
- `app/api/admin/auth/route.ts` accepts a password, compares it against `ADMIN_PASSWORD` (defaults to `spazio2024`), and sets the session cookie.
- The cookie is `httpOnly`, path `/`, and lasts 24 hours. It is marked `secure` only in production.

## API Routes

All API routes return JSON and perform no input validation beyond simple type coercion.

- `GET/POST/PUT/DELETE /api/movies` — CRUD for movies.
- `GET/POST/PUT/DELETE /api/screenings` — CRUD for screenings. Creating a screening auto-generates its seats.
- `GET /api/screenings/[id]/seats` and `PUT /api/screenings/[id]/seats` — fetch or bulk-update seat statuses.
- `GET/POST/PUT/DELETE /api/events` — CRUD for events.
- `GET/POST/PUT/DELETE /api/gallery` — CRUD for gallery photos stored in SQLite.
- `GET/POST/DELETE /api/reservations` — list, create, or cancel reservations. Creating a reservation also marks seats as reserved.
- `GET/POST/DELETE /api/admin/auth` — login, logout, session check.
- `GET /api/gallery-assets/[name]` — serves local image files from `assets/images` with long-term caching.

## Code Style and Conventions

### TypeScript

- Strict mode is enabled (`strict: true` in `tsconfig.json`).
- No implicit `any`; types for database rows are defined in `lib/queries.ts`.
- Use the `Seat`, `Screening`, `Movie`, `Event`, `GalleryPhoto`, and `Reservation` types from `lib/queries.ts`.

### Tailwind / Styling

- The design system is defined in `tailwind.config.ts`: custom colors (`cream`, `charcoal`, `terra`, `gold`, etc.), font families (`display`, `body`, `editorial`), and custom easing curves (`fluid`, `snap`).
- Reusable component classes live in `app/globals.css` under `@layer components`: `.btn-gold`, `.btn-dark`, `.btn-outline`, `.section-title`, `.paper-panel`, `.dark-panel`, `.film-contact-sheet`, etc.
- Animations are GPU-safe (mostly `transform` and `opacity`).
- Mobile-first responsive prefixes are used consistently (`md:`, `lg:`, `xl:`).
- Layout max-width is generally `max-w-[1600px]` with horizontal padding `px-6 md:px-10`.

### Components

- `SectionReveal` wraps most page sections. It uses `IntersectionObserver` to fade elements up on scroll, with an optional delay prop.
- `EditorialImage` wraps `next/image` and provides a text fallback if the image fails to load.
- `GalleryFilmStrip` renders a 35mm film-strip-style marquee from local `assets/images/gallery` files.
- `SeatMap` is shared between the public reservation flow and the admin seats tab.
- `ReservationFlow` handles seat selection, guest details, and the confirmation screen.

### Assets

- Remote images are allowed from `images.unsplash.com` and `image.tmdb.org` (configured in `next.config.js`).
- Local gallery images are read from `assets/images/gallery` by `lib/gallery-assets.ts` and served through `/api/gallery-assets/[name]`.
- Local poster images are stored in `assets/images/posters` and served through `/api/poster-assets/[name]`. Demo movies use these local posters instead of remote URLs.

## Security Considerations

- Admin authentication is password-only and the default password is hard-coded. In production, set `ADMIN_PASSWORD` to a strong value.
- The session cookie value is a static string (`authenticated`), not a signed token.
- API routes do not validate inputs, sanitize strings, or implement rate limiting.
- `DATABASE_URL` must be configured in every deployment environment and should use the Neon pooled connection string.
- No HTTPS or security headers are configured beyond Next.js defaults.
- The contact form is client-side only and does not send data anywhere.
- No payment processing is implemented.
- The private movie Google Maps URL is looked up server-side only after a successful reservation.

## Deployment Notes

- The project is a standard Next.js application. Build with `npm run build` and start with `npm start`.
- Environment variables: `DATABASE_URL` is required; `DATABASE_URL_UNPOOLED` is used by migrations; `ADMIN_PASSWORD` overrides the default admin password.
- The `out/` directory is ignored; this project is not currently configured for static export.

## Development Checklist for Agents

When modifying this project:

1. Keep the existing editorial visual style (warm cream/charcoal palette, custom fonts, generous whitespace).
2. Reuse Tailwind component classes from `globals.css` rather than inventing new inline styles.
3. Use `SectionReveal` for new page sections so scroll behavior stays consistent.
4. Add database changes through an explicit PostgreSQL migration and update `lib/queries.ts` types and async functions.
5. Keep server/client boundaries clear: put data fetching in Server Components, put interactivity in Client Components.
6. If you add new remote image hostnames, update `images.remotePatterns` in `next.config.js`.
7. Do not commit `data/*.db*` files; they are gitignored.
