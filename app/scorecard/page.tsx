import { db, initDB } from '@/lib/db'
import { scorecardMetrics, engines } from '@/lib/db/schema'
import { ScorecardView } from '@/components/scorecard/scorecard-view'

export const dynamic = 'force-dynamic'

export default async function ScorecardPage() {
  initDB()
  const [metrics, engineList] = await Promise.all([
    db.select().from(scorecardMetrics).orderBy(scorecardMetrics.sortOrder),
    db.select().from(engines),
  ])

  return <ScorecardView metrics={metrics} engines={engineList} />
}
