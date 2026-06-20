'use client'

import Image from 'next/image'
import { useState } from 'react'

type EditorialImageProps = {
  alt: string
  className?: string
  fallbackMeta?: string
  fallbackTitle?: string
  priority?: boolean
  sizes?: string
  src: string
}

export default function EditorialImage({
  alt,
  className,
  fallbackMeta,
  fallbackTitle,
  priority = false,
  sizes,
  src,
}: EditorialImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex h-full w-full items-end bg-[linear-gradient(180deg,#3a241d_0%,#1a1410_100%)] p-4 text-cream">
        <div>
          {fallbackMeta ? (
            <p className="text-[11px] uppercase tracking-[0.22em] text-cream/56">{fallbackMeta}</p>
          ) : null}
          <p className="mt-2 font-display text-3xl uppercase leading-[0.9]">{fallbackTitle ?? alt}</p>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
