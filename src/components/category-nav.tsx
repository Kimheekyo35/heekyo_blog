'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function CategoryNav({
  categories,
}: {
  categories: readonly { slug: string; label: string }[]
}) {
  const pathname = usePathname()

  const items = [
    { href: '/', label: '전체' },
    ...categories.map((c) => ({ href: `/category/${c.slug}`, label: c.label })),
  ]

  return (
    <nav className="flex items-center gap-1 -mb-px overflow-x-auto">
      {items.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 px-3 py-2.5 text-sm border-b-2 transition-colors ${
              active
                ? 'border-accent text-white font-semibold'
                : 'border-transparent text-white/85 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
