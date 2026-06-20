'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Inizio' },
  { href: '/schedule', label: 'Prossima serata' },
  { href: '/about', label: 'Il progetto' },
  { href: '/gallery', label: 'Galleria' },
  { href: '/contact', label: 'Contatti' },
]

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-charcoal/12 bg-cream/88 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="flex min-h-[72px] items-center justify-between gap-6 py-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/14 bg-charcoal text-cream font-display text-lg">S</div>
              <div className="min-w-0 leading-none">
                <span className="block font-display text-xl uppercase tracking-[0.04em]">Spazio</span>
                <span className="block truncate font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-smoke">Cinema condiviso / Nola</span>
              </div>
            </Link>

            <div className="hidden xl:flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-charcoal/58">
              <span>Spazio indipendente</span>
              <span className="h-3 w-px bg-charcoal/18" />
              <span>Una comunità in movimento</span>
              <span className="h-3 w-px bg-charcoal/18" />
              <span>Dal 2024</span>
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden flex h-11 w-11 items-center justify-center border border-charcoal/14 bg-parchment/80"
              aria-label="Apri menu"
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <span className={`h-0.5 w-6 bg-charcoal transition-all duration-500 ease-fluid ${open ? 'translate-y-2 rotate-45' : ''}`} />
                <span className={`h-0.5 w-6 bg-charcoal transition-all duration-500 ease-fluid ${open ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 w-6 bg-charcoal transition-all duration-500 ease-fluid ${open ? '-translate-y-2 -rotate-45' : ''}`} />
              </div>
            </button>
          </div>

          <div className="hidden md:flex items-center justify-between gap-6 border-t border-charcoal/8 py-3">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${
                    pathname === link.href ? 'text-terra' : 'text-charcoal hover:text-terra'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Link href="/reserve" className="btn-gold">
              Tieni un posto
            </Link>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-cream/96 backdrop-blur-md transition-all duration-500 ease-fluid md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-full flex-col justify-between px-8 pb-10 pt-28">
          <div>
            <p className="eyebrow mb-8">Un film / Uno spazio / Insieme</p>
            <div className="flex flex-col gap-4">
              {links.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`font-display text-5xl uppercase leading-none transition-all duration-500 ease-fluid ${
                    open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  } ${pathname === link.href ? 'text-terra' : 'text-charcoal'}`}
                  style={{ transitionDelay: open ? `${50 + i * 50}ms` : '0ms' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className={`space-y-6 transition-all duration-500 ease-fluid ${open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: open ? `${50 + links.length * 50}ms` : '0ms' }}>
            <Link href="/reserve" onClick={() => setOpen(false)} className="btn-gold w-full">
              Tieni un posto
            </Link>
            <div className="border-t border-charcoal/10 pt-4 text-sm text-charcoal/70">
              <p className="font-editorial text-2xl italic text-charcoal">Ci incontriamo per guardare film e restare a parlarne.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
