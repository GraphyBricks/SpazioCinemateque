import type { Metadata } from 'next'
import { Bebas_Neue, Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ensureDb } from '@/lib/init'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-editorial',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Spazio Cinematheque',
  description: 'Uno spazio indipendente a Nola per guardare film insieme e continuare la conversazione oltre i titoli di coda.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  ensureDb()
  return (
    <html lang="it" className={`${bebasNeue.variable} ${plusJakarta.variable} ${cormorant.variable}`}>
      <body className="bg-cream text-charcoal font-body antialiased">
        <div className="fixed inset-0 pointer-events-none z-[5] opacity-[0.03] mix-blend-multiply grain" aria-hidden="true" />
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
