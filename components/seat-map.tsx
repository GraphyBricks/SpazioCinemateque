'use client'

import { useMemo } from 'react'
import type { Seat } from '@/lib/queries'

function seatTypeLabel(type: Seat['type']) {
  if (type === 'premium') return 'premium'
  if (type === 'wheelchair') return 'accessibile'
  return 'standard'
}

export default function SeatMap({
  seats,
  selected,
  onToggle,
}: {
  seats: Seat[]
  selected: number[]
  onToggle: (id: number) => void
}) {
  const rows = useMemo(() => {
    const grouped = new Map<string, Seat[]>()
    for (const seat of seats) {
      if (!grouped.has(seat.row)) grouped.set(seat.row, [])
      grouped.get(seat.row)!.push(seat)
    }
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [seats])

  function seatClasses(seat: Seat) {
    const base = 'w-8 h-8 md:w-10 md:h-10 rounded-sm flex items-center justify-center text-[10px] md:text-xs font-bold transition-all duration-300 ease-fluid'
    const isSelected = selected.includes(seat.id)

    if (seat.status === 'reserved') {
      return `${base} bg-charcoal/30 text-charcoal/40 cursor-not-allowed`
    }
    if (isSelected) {
      return `${base} bg-gold text-charcoal scale-110 cursor-pointer`
    }
    if (seat.type === 'premium') {
      return `${base} bg-transparent border-2 border-gold text-gold hover:bg-gold/10 cursor-pointer`
    }
    if (seat.type === 'wheelchair') {
      return `${base} bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10 cursor-pointer`
    }
    return `${base} bg-transparent border-2 border-terra text-terra hover:bg-terra/10 cursor-pointer`
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[320px] mx-auto">
        <div className="w-3/4 h-1 mx-auto mb-8 bg-charcoal/10" />
        <div className="space-y-3 md:space-y-4">
          {rows.map(([row, rowSeats]) => (
            <div key={row} className="flex items-center justify-center gap-2 md:gap-3">
              <span className="w-5 text-xs font-display text-stone">{row}</span>
              <div className="flex gap-2 md:gap-3">
                {rowSeats.map(seat => (
                  <button
                    key={seat.id}
                    disabled={seat.status === 'reserved'}
                    onClick={() => onToggle(seat.id)}
                    className={seatClasses(seat)}
                    aria-label={`Posto ${seat.row}${seat.seat_number} ${seatTypeLabel(seat.type)}`}
                  >
                    {seat.type === 'premium' && !selected.includes(seat.id) ? '★' : seat.type === 'wheelchair' ? '♿' : seat.seat_number}
                  </button>
                ))}
              </div>
              <span className="w-5 text-xs font-display text-stone">{row}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-5 text-[10px] uppercase tracking-wider text-stone font-body">
          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm border-2 border-terra" /> Disponibile</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm border-2 border-gold" /> Premium</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm border-2 border-blue-500" /> Accessibile</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-gold" /> Selezionato</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-charcoal/30" /> Riservato</span>
        </div>
      </div>
    </div>
  )
}
