export default function SectionNumber({ number }: { number: string }) {
  return (
    <span className="inline-block font-display text-8xl md:text-9xl font-bold text-charcoal/5 leading-none select-none">
      {number}
    </span>
  )
}
