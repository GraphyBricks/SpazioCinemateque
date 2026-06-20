'use client'

import { useState } from 'react'
import SectionReveal from '@/components/section-reveal'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section className="min-h-screen pt-24 md:pt-28 pb-20 md:pb-32 px-6 md:px-10 bg-cream">
      <div className="max-w-[1600px] mx-auto">
        <SectionReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-stone mb-3 font-body">Parliamone</p>
        </SectionReveal>
        <SectionReveal delay={100}>
          <h1 className="section-title mb-12 md:mb-20">Contatti</h1>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
          <SectionReveal>
            <div className="space-y-10">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone mb-2 font-body">Dove ci incontriamo</p>
                <p className="font-display text-3xl md:text-5xl uppercase leading-none">Secret location<br />Nola</p>
                <p className="mt-4 max-w-lg text-charcoal/62">Il link Google Maps con l'indirizzo preciso è visibile solo dopo la prenotazione.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone mb-2 font-body">Email</p>
                <a href="mailto:info@spaziocinematheque.com" className="font-display text-3xl md:text-5xl uppercase leading-none hover:text-terra transition-colors">info@spaziocinematheque.com</a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone mb-4 font-body">Ci trovi anche qui</p>
                <a
                  href="https://www.instagram.com/spazio_cinematheque/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-3xl uppercase tracking-tight transition-colors hover:text-terra"
                >
                  Instagram
                </a>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={200}>
            <div className="border border-charcoal/10 p-6 md:p-10">
              {sent ? (
                <div className="text-center py-12">
                  <p className="font-display text-4xl uppercase mb-3">Messaggio inviato</p>
                  <p className="text-charcoal/70 font-body">Ti risponderemo al piu presto.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-stone mb-2 font-body">Nome</label>
                    <input required type="text" className="w-full px-4 py-3 rounded-sm bg-wheat border-0 focus:ring-2 focus:ring-gold outline-none transition-all duration-500" placeholder="Il tuo nome" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-stone mb-2 font-body">Email</label>
                    <input required type="email" className="w-full px-4 py-3 rounded-sm bg-wheat border-0 focus:ring-2 focus:ring-gold outline-none transition-all duration-500" placeholder="tu@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-stone mb-2 font-body">Messaggio</label>
                    <textarea required rows={5} className="w-full px-4 py-3 rounded-sm bg-wheat border-0 focus:ring-2 focus:ring-gold outline-none transition-all duration-500" placeholder="Scrivici qualcosa..." />
                  </div>
                  <button type="submit" className="btn-gold w-full justify-center">
                    Invia messaggio
                  </button>
                </form>
              )}
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  )
}
