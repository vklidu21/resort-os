'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', emoji: '🏠' },
  { href: '/compass', label: 'Compass', emoji: '🧭' },
  { href: '/roadmap', label: 'Roadmap', emoji: '🗺️' },
  { href: '/tasks', label: 'Tasks', emoji: '📋' },
  { href: '/team', label: 'Team', emoji: '👥' },
  { href: '/scorecard', label: 'Scorecard', emoji: '📊' },
  { href: '/memory', label: 'Memory', emoji: '🧠' },
  { href: '/playbooks', label: 'Playbooks', emoji: '📖' },
  { href: '/rhythm', label: 'Rhythm', emoji: '🔄' },
  { href: '/settings', label: 'Settings', emoji: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-base-300 bg-base-50">
        <div className="flex h-14 items-center gap-2 border-b border-base-300 px-4">
          <span className="text-xl">🌺</span>
          <span className="font-semibold text-sm tracking-wide">ResortOS</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-accent-purple/10 text-accent-purple border-r-2 border-accent-purple'
                    : 'text-[#8888a0] hover:text-[#f0f0f5] hover:bg-base-200'
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-base-300 p-3 text-xs text-[#8888a0]">
          Poinciana Global Village
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-base-300 bg-base-50">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
                isActive ? 'text-accent-purple' : 'text-[#8888a0]'
              }`}
            >
              <span className="text-lg">{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
