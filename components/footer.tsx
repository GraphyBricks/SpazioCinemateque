import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-charcoal/12 bg-[#eee3d2] px-6 py-16 text-charcoal md:px-10 md:py-24">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-12 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow">Spazio Cinematheque · Nola</p>
            <h2 className="mt-7 max-w-5xl font-display text-[19vw] uppercase leading-[0.8] md:text-[8rem] lg:text-[10rem]">
              Il film finisce.
              <span className="block font-editorial text-[14vw] normal-case italic text-terra md:text-[5rem] lg:text-[6rem]">
                La serata no.
              </span>
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-charcoal/70">
              Uno spazio che prende forma ogni volta attraverso il film scelto e le persone che vengono a condividerlo.
            </p>
          </div>

          <div className="grid content-start gap-9">
            <div className="border-t border-charcoal/12 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-charcoal/54">Restiamo in contatto</p>
              <div className="mt-5 flex flex-col items-start gap-3">
                <a
                  href="https://www.instagram.com/spazio_cinematheque/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-4xl uppercase transition-colors hover:text-terra"
                >
                  Instagram
                </a>
                <a href="mailto:info@spaziocinematheque.com" className="text-base transition-colors hover:text-terra">
                  info@spaziocinematheque.com
                </a>
              </div>
            </div>

            <div className="border-t border-charcoal/12 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-charcoal/54">Dove ci incontriamo</p>
              <p className="mt-4 text-lg leading-relaxed text-charcoal/72">
                Secret location · Nola.<br />Il link Google Maps appare dopo la prenotazione.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-charcoal/12 pt-6 text-xs uppercase tracking-[0.18em] text-smoke md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Spazio Cinematheque</p>
          <div className="flex items-center gap-4">
            <p>Un film · Uno spazio · Insieme</p>
            <Link href="/admin" className="transition-colors hover:text-terra">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
