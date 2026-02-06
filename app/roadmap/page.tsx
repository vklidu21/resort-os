import { db, initDB } from '@/lib/db'
import { milestones, engines } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export default async function RoadmapPage() {
  initDB()
  const [allMilestones, engineList] = await Promise.all([
    db.select().from(milestones).orderBy(milestones.sortOrder),
    db.select().from(engines),
  ])

  const engineMap = Object.fromEntries(engineList.map(e => [e.id, e]))
  const grouped: Record<string, typeof allMilestones> = {}
  for (const m of allMilestones) {
    const key = m.quarter || 'Unplanned'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  }

  const statusIcon = (s: string | null) => s === 'done' ? '✅' : s === 'active' ? '🟡' : '⬜'

  return (
    <div className="space-y-6 max-w-4xl">
      {Object.entries(grouped).map(([quarter, items]) => (
        <section key={quarter} className="rounded-lg border border-base-300 bg-base-100 p-5">
          <h2 className="text-base font-medium mb-4">{quarter}</h2>
          <div className="space-y-3">
            {items.map(m => (
              <div key={m.id} className="flex items-center gap-3 text-sm">
                <span className="text-lg">{statusIcon(m.status)}</span>
                <div className="flex-1">
                  <span className="font-medium">{m.title}</span>
                  {m.description && <span className="text-[#8888a0] ml-2 text-xs">{m.description}</span>}
                </div>
                {m.engineId && engineMap[m.engineId] && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-base-300 text-[#8888a0]">
                    {engineMap[m.engineId].emoji} {engineMap[m.engineId].name}
                  </span>
                )}
                {m.targetDate && (
                  <span className="text-xs text-[#8888a0]">{m.targetDate}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {allMilestones.length === 0 && (
        <div className="text-center py-12 text-[#8888a0]">
          <p>No milestones yet. Run the seed script to import from your workspace.</p>
        </div>
      )}
    </div>
  )
}
