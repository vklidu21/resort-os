import { db, initDB } from '@/lib/db'
import { tasks, engines, teamMembers, scorecardMetrics, activityLog, compass } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import { TASK_STATUS_EMOJI, TASK_STATUS_LABELS, PRIORITY_COLORS, METRIC_STATUS_COLORS } from '@/lib/constants'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  initDB()

  // Fetch all dashboard data
  const [
    compassData,
    engineList,
    taskCounts,
    activeTasks,
    members,
    metrics,
    recentActivity,
  ] = await Promise.all([
    db.select().from(compass).limit(1).then(r => r[0]),
    db.select().from(engines),
    db.select({
      status: tasks.status,
      count: sql<number>`count(*)`,
    }).from(tasks).groupBy(tasks.status),
    db.select().from(tasks).where(eq(tasks.status, 'in_progress')).limit(5),
    db.select().from(teamMembers),
    db.select().from(scorecardMetrics).orderBy(scorecardMetrics.sortOrder).limit(6),
    db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(10),
  ])

  const countMap: Record<string, number> = {}
  for (const row of taskCounts) {
    countMap[row.status] = row.count
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Compass Strip */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CompassCard
          emoji="🌟"
          label="North Star"
          value={compassData?.northStar || 'Not set'}
        />
        <CompassCard
          emoji="📍"
          label="Current Reality"
          value={compassData?.currentReality ? 'Defined' : 'Not set'}
        />
        <CompassCard
          emoji="🎯"
          label="Gaps"
          value={compassData?.gaps ? `${JSON.parse(compassData.gaps).length} gaps` : 'Not set'}
        />
        <CompassCard
          emoji="🧭"
          label="Strategic Anchors"
          value={compassData?.strategicAnchors ? `${JSON.parse(compassData.strategicAnchors).length} anchors` : 'Not set'}
        />
      </section>

      {/* Engines */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-[#8888a0] uppercase tracking-wider">Engines</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {engineList.length > 0 ? engineList.map((engine) => (
            <div
              key={engine.id}
              className="rounded-lg border border-base-300 bg-base-100 p-4"
              style={{ borderLeftColor: engine.color || '#8b5cf6', borderLeftWidth: 3 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span>{engine.emoji}</span>
                <span className="font-medium text-sm">{engine.name}</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green">
                  {engine.status}
                </span>
              </div>
              <p className="text-xs text-[#8888a0]">{engine.description || engine.goal || 'No description'}</p>
            </div>
          )) : (
            <p className="text-sm text-[#8888a0] col-span-3">No engines defined. <Link href="/settings" className="text-accent-purple hover:underline">Set up engines</Link></p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tasks Summary */}
        <section className="rounded-lg border border-base-300 bg-base-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[#8888a0] uppercase tracking-wider">Tasks</h2>
            <Link href="/tasks" className="text-xs text-accent-purple hover:underline">View All</Link>
          </div>
          <div className="flex gap-3 mb-4">
            <StatBadge label="Inbox" value={countMap['inbox'] || 0} />
            <StatBadge label="Active" value={countMap['in_progress'] || 0} />
            <StatBadge label="Blocked" value={countMap['blocked'] || 0} color="text-accent-red" />
            <StatBadge label="Done" value={countMap['done'] || 0} color="text-accent-green" />
          </div>
          {activeTasks.length > 0 ? (
            <ul className="space-y-2">
              {activeTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-2 text-sm">
                  <span className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || ''}>
                    {TASK_STATUS_EMOJI[task.status as keyof typeof TASK_STATUS_EMOJI]}
                  </span>
                  <Link href={`/tasks/${task.id}`} className="hover:text-accent-purple truncate">
                    {task.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#8888a0]">No active tasks</p>
          )}
        </section>

        {/* Scorecard */}
        <section className="rounded-lg border border-base-300 bg-base-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[#8888a0] uppercase tracking-wider">Scorecard</h2>
            <Link href="/scorecard" className="text-xs text-accent-purple hover:underline">View All</Link>
          </div>
          {metrics.length > 0 ? (
            <div className="space-y-2">
              {metrics.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8888a0]">{m.currentValue || '-'} / {m.targetValue || '-'}</span>
                    <span className={`text-xs ${METRIC_STATUS_COLORS[m.status as keyof typeof METRIC_STATUS_COLORS] || ''}`}>
                      {m.status === 'green' ? '🟢' : m.status === 'yellow' ? '🟡' : '🔴'}
                    </span>
                    <span className="text-xs">
                      {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8888a0]">No metrics defined. <Link href="/scorecard" className="text-accent-purple hover:underline">Add metrics</Link></p>
          )}
        </section>

        {/* Team */}
        <section className="rounded-lg border border-base-300 bg-base-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[#8888a0] uppercase tracking-wider">Team</h2>
            <Link href="/team" className="text-xs text-accent-purple hover:underline">Manage</Link>
          </div>
          {members.length > 0 ? (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-base-300 text-xs">
                    {m.avatarEmoji || m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="truncate">{m.name}</span>
                    <span className="ml-2 text-xs text-[#8888a0]">{m.type === 'ai' ? '🤖' : '👤'}</span>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    m.status === 'active' ? 'bg-accent-green/10 text-accent-green' : 'bg-base-300 text-[#8888a0]'
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8888a0]">No team members. <Link href="/team" className="text-accent-purple hover:underline">Add members</Link></p>
          )}
        </section>
      </div>

      {/* Activity Feed */}
      <section className="rounded-lg border border-base-300 bg-base-100 p-4">
        <h2 className="text-sm font-medium text-[#8888a0] uppercase tracking-wider mb-3">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-2">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <span className="text-xs text-[#8888a0] whitespace-nowrap mt-0.5">
                  {a.createdAt?.slice(5, 16)}
                </span>
                <span>{a.description}</span>
                {a.autonomyLevel && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-base-300 text-[#8888a0]">
                    {a.autonomyLevel}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8888a0]">No activity yet. Start by adding tasks or editing the compass.</p>
        )}
      </section>
    </div>
  )
}

function CompassCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <Link href="/compass" className="rounded-lg border border-base-300 bg-base-100 p-4 hover:border-accent-purple/50 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <span>{emoji}</span>
        <span className="text-xs text-[#8888a0] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm line-clamp-2">{value}</p>
    </Link>
  )
}

function StatBadge({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-semibold ${color || ''}`}>{value}</div>
      <div className="text-xs text-[#8888a0]">{label}</div>
    </div>
  )
}
