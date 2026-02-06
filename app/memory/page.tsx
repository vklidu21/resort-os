import { db, initDB } from '@/lib/db'
import { memoryLogs, decisionRecords, lessonsLearned } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MemoryPage() {
  initDB()
  const [logs, decisions, lessons] = await Promise.all([
    db.select().from(memoryLogs).orderBy(desc(memoryLogs.date)).limit(14),
    db.select().from(decisionRecords).orderBy(desc(decisionRecords.createdAt)).limit(10),
    db.select().from(lessonsLearned).orderBy(desc(lessonsLearned.createdAt)).limit(10),
  ])

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Daily Logs */}
      <section className="rounded-lg border border-base-300 bg-base-100 p-5">
        <h2 className="text-sm font-medium text-[#8888a0] uppercase tracking-wider mb-3">📅 Daily Logs</h2>
        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 text-sm border-b border-base-300/50 pb-2">
                <span className="text-xs text-accent-purple font-mono whitespace-nowrap mt-0.5">{log.date}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-base-300 text-[#8888a0]">{log.logType}</span>
                <p className="text-[#8888a0] line-clamp-2 flex-1">{log.content?.slice(0, 200)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8888a0]">No logs yet. Agents will create daily logs as they work.</p>
        )}
      </section>

      {/* Decision Records */}
      <section className="rounded-lg border border-base-300 bg-base-100 p-5">
        <h2 className="text-sm font-medium text-[#8888a0] uppercase tracking-wider mb-3">📝 Decision Records</h2>
        {decisions.length > 0 ? (
          <div className="space-y-2">
            {decisions.map(d => (
              <div key={d.id} className="text-sm border-b border-base-300/50 pb-2">
                <div className="font-medium">{d.title}</div>
                {d.decision && <p className="text-xs text-[#8888a0] mt-1">{d.decision}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8888a0]">No decisions recorded yet.</p>
        )}
      </section>

      {/* Lessons Learned */}
      <section className="rounded-lg border border-base-300 bg-base-100 p-5">
        <h2 className="text-sm font-medium text-[#8888a0] uppercase tracking-wider mb-3">💡 Lessons Learned</h2>
        {lessons.length > 0 ? (
          <div className="space-y-2">
            {lessons.map(l => (
              <div key={l.id} className="text-sm border-b border-base-300/50 pb-2">
                <div className="font-medium">{l.title}</div>
                {l.insight && <p className="text-xs text-[#8888a0] mt-1">{l.insight}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8888a0]">No lessons yet. Evaluate completed tasks to capture learnings.</p>
        )}
      </section>
    </div>
  )
}
