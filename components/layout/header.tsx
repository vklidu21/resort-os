'use client'

import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/compass': 'Clarity Compass',
  '/roadmap': 'Roadmap & Milestones',
  '/tasks': 'Task Management',
  '/team': 'Team & Roles',
  '/scorecard': 'Scorecard',
  '/memory': 'Memory Hub',
  '/playbooks': 'Playbooks',
  '/rhythm': 'Rhythm',
  '/settings': 'Settings',
}

export function Header() {
  const pathname = usePathname()
  const title =
    PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES).find(([key]) =>
      key !== '/' && pathname.startsWith(key)
    )?.[1] ||
    'ResortOS'

  return (
    <header className="flex h-14 items-center justify-between border-b border-base-300 bg-base-50 px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-xs text-[#8888a0]">
          Q1 2026 · Week {getWeekNumber()}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/20 text-sm">
          D
        </div>
      </div>
    </header>
  )
}

function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
}
