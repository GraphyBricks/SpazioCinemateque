'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Screening, Seat } from '@/lib/queries'
import SectionReveal from './section-reveal'

const dateFormat = new Intl.DateTimeFormat('it-IT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export default function ReservationFlow({ screening, seats }: { screening: Screening; seats: Seat[] }) {
  const availableSeats = seats.filter((seat) => seat.status === 'available')
  const maxGuests = Math.min(8, availableSeats.length)
  const [guestCount, setGuestCount] = useState(maxGuests > 0 ? 1 : 0)
  const [form, setForm] = useState({ customer_name: '', email: '', phone: '' })
  const [confirmed, setConfirmed] = useState(false)
  const [code, setCode] = useState('')
  const [mapsUrl, setMapsUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (guestCount < 1) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          screening_id: screening.id,
          seat_ids: availableSeats.slice(0, guestCount).map((seat) => seat.id),
        }),
      })
      if (!res.ok) throw new Error('reservation failed')
      const data = await res.json()
      setCode(data.confirmation_code)
      setMapsUrl(data.maps_url || '')
      setConfirmed(true)
    } catch {
      setError('Qualcosa non ha funzionato. Riprova tra un momento.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <SectionReveal>
        <div className="paper-panel p-8 text-center md:p-16">
          <p className="eyebrow">Ci vediamo alla proiezione</p>
          <h1 className="mt-6 font-display text-6xl uppercase leading-[0.86] md:text-8xl">{screening.movie_title}</h1>
          <p className="mt-5 text-lg text-charcoal/68">
            {dateFormat.format(new Date(screening.date + 'T00:00:00'))} · ore {screening.time}
          </p>
          <p className="mt-2 font-editorial text-3xl italic text-terra">
            {guestCount === 1 ? 'Un posto è tuo.' : guestCount + ' posti sono vostri.'}
          </p>
          <div className="mt-8 inline-block bg-gold/18 px-8 py-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-stone">Codice di conferma</p>
            <p className="mt-2 font-display text-4xl tracking-widest md:text-5xl">{code}</p>
          </div>
          {mapsUrl ? (
            <div className="mx-auto mt-8 max-w-xl border border-charcoal/12 bg-cream p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone">Secret location</p>
              <p className="mt-3 font-editorial text-3xl italic text-charcoal">Ora sai dove trovarci.</p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold mt-5 w-full"
              >
                Apri la posizione su Google Maps
              </a>
            </div>
          ) : (
            <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-charcoal/62">
              La prenotazione è confermata. Il link alla secret location non è ancora disponibile online; te lo comunicheremo prima della serata.
            </p>
          )}
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-charcoal/62">
            Non serve scegliere una sedia: lo spazio si compone insieme, quando arriviamo.
          </p>
          <Link href="/" className="btn-dark mt-10">Torna all'inizio</Link>
        </div>
      </SectionReveal>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
      <SectionReveal>
        <div className="lg:sticky lg:top-36">
          <p className="eyebrow">Tieni un posto</p>
          <h1 className="mt-6 font-display text-6xl uppercase leading-[0.84] md:text-8xl">{screening.movie_title}</h1>
          <p className="mt-5 text-lg capitalize text-charcoal/68">
            {dateFormat.format(new Date(screening.date + 'T00:00:00'))}
          </p>
          <p className="mt-1 font-editorial text-3xl italic text-terra">Si comincia alle {screening.time}</p>
          <div className="mt-8 border-t border-charcoal/12 pt-6">
            <p className="text-sm leading-relaxed text-charcoal/62">
              La prenotazione ci aiuta a organizzare uno spazio condiviso, senza file o posti numerati. Segna chi viene con te; al resto pensiamo noi.
            </p>
          </div>
        </div>
      </SectionReveal>

      <SectionReveal delay={120}>
        <div className="paper-panel p-6 md:p-10">
          {maxGuests === 0 ? (
            <div className="py-10 text-center">
              <p className="font-display text-5xl uppercase">Siamo al completo</p>
              <p className="mx-auto mt-4 max-w-md text-charcoal/68">Questa serata è al completo. Scrivici: se si libera un posto, proviamo ad avvisarti.</p>
              <Link href="/contact" className="btn-dark mt-7">Scrivici</Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div>
                <div className="mb-7 border-b border-charcoal/12 pb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terra">
                    {availableSeats.length <= 10 ? availableSeats.length + ' posti rimasti' : 'Posti disponibili'}
                  </p>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">Quante persone sarete?</p>
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">
                  {Array.from({ length: maxGuests }, (_, index) => index + 1).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setGuestCount(count)}
                      className={'min-h-16 border font-display text-3xl transition-all duration-300 ' + (
                        guestCount === count
                          ? 'border-charcoal bg-charcoal text-cream'
                          : 'border-charcoal/16 bg-cream text-charcoal hover:border-terra hover:text-terra'
                      )}
                      aria-pressed={guestCount === count}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-charcoal/52">Puoi riservare fino a otto posti con un solo nome.</p>
              </div>

              <div className="mt-9 space-y-5 border-t border-charcoal/12 pt-8">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">Nome e cognome</label>
                  <input
                    required
                    type="text"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    className="mt-2 w-full border-0 bg-wheat px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-gold"
                    placeholder="Come ti chiami?"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-2 w-full border-0 bg-wheat px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-gold"
                    placeholder="tu@example.com"
                  />
                  <p className="mt-2 text-xs text-charcoal/52">Dopo la conferma vedrai qui il link Google Maps con la secret location.</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">Telefono <span className="normal-case tracking-normal">(facoltativo)</span></label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-2 w-full border-0 bg-wheat px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-gold"
                    placeholder="+39"
                  />
                </div>
              </div>

              {error ? <p className="mt-5 text-sm text-rust">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="btn-gold mt-8 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Un momento...' : guestCount === 1 ? 'Tieni un posto' : 'Tieni ' + guestCount + ' posti'}
              </button>
              <p className="mt-4 text-center text-xs leading-relaxed text-charcoal/48">Nessun pagamento. Se cambi idea, avvisaci così possiamo invitare qualcun altro.</p>
            </form>
          )}
        </div>
      </SectionReveal>
    </div>
  )
}
