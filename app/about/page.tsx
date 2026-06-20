import EditorialImage from '@/components/editorial-image'
import SectionReveal from '@/components/section-reveal'
import { getAssetGalleryPhotos } from '@/lib/gallery-assets'

export default async function AboutPage() {
  const [housePhoto] = await getAssetGalleryPhotos()

  return (
    <section className="min-h-screen bg-cream px-6 pb-20 pt-28 md:px-10 md:pb-32 md:pt-36">
      <div className="mx-auto max-w-[1500px]">
        <SectionReveal>
          <p className="eyebrow">Perché esistiamo</p>
          <h1 className="section-title mt-5">Il progetto</h1>
        </SectionReveal>

        <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <SectionReveal>
            <div className="dark-panel flex h-full flex-col justify-between p-8 md:p-12">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Spazio Cinematheque · Nola</p>
                <h2 className="mt-6 font-display text-5xl uppercase leading-[0.86] md:text-7xl">
                  Uno spazio comune attorno al cinema
                </h2>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-cream/74 md:text-xl">
                  Spazio Cinematheque nasce dal desiderio di vedere bene un film e parlarne meglio. È un progetto indipendente in cui la programmazione non è un catalogo, ma un invito: un titolo scelto con cura e un gruppo di persone disposto a condividerlo.
                </p>
              </div>
              <p className="mt-10 border-t border-cream/12 pt-7 font-editorial text-3xl italic leading-tight text-gold md:text-4xl">
                Il film ci porta nello stesso luogo. La conversazione fa il resto.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={140}>
            <div className="image-frame relative min-h-[34rem] h-full">
              {housePhoto ? (
                <EditorialImage
                  src={housePhoto.src}
                  alt="Una serata a Spazio Cinematheque"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  fallbackMeta="Nola"
                  fallbackTitle="Il nostro spazio"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/58 via-transparent to-transparent" />
                  <p className="absolute bottom-5 left-5 right-5 text-xs uppercase tracking-[0.2em] text-cream/72">Una delle nostre serate · Nola</p>
            </div>
          </SectionReveal>
        </div>

        <div className="mt-20 grid gap-8 border-t border-charcoal/12 pt-12 md:grid-cols-3 md:pt-16">
          {[
            {
              number: '01',
              title: 'Una scelta alla volta',
              text: 'Nessun catalogo e nessuna sovrapposizione. Ogni incontro nasce attorno a un titolo scelto perché vale la pena condividerlo.',
            },
            {
              number: '02',
              title: 'Presenza condivisa',
              text: 'Guardare insieme cambia il film: l’attenzione, le reazioni e il silenzio costruiscono un’esperienza che nessuno avrebbe da solo.',
            },
            {
              number: '03',
              title: 'Conversazione aperta',
              text: 'La proiezione non termina con i titoli di coda. Il confronto dopo il film è parte essenziale di ciò che facciamo.',
            },
          ].map((item, index) => (
            <SectionReveal key={item.title} delay={index * 80}>
              <p className="font-display text-5xl text-terra/30">{item.number}</p>
              <h3 className="mt-4 font-display text-4xl uppercase leading-[0.9]">{item.title}</h3>
              <p className="mt-5 text-base leading-relaxed text-charcoal/68">{item.text}</p>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={220}>
          <div className="paper-panel mt-20 grid gap-8 p-8 md:p-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <h2 className="font-display text-5xl uppercase leading-[0.88] md:text-6xl">Come partecipare</h2>
            <p className="text-lg leading-relaxed text-charcoal/70">
              Non serve conoscere già qualcuno né avere una tessera. Basta prenotare, arrivare con curiosità e avere voglia di restare dopo i titoli di coda. Il link Google Maps con la secret location appare dopo la conferma.
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
