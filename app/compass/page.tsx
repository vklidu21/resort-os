import { db, initDB } from '@/lib/db'
import { compass } from '@/lib/db/schema'
import { CompassEditor } from '@/components/compass/compass-editor'

export const dynamic = 'force-dynamic'

export default async function CompassPage() {
  initDB()
  const data = await db.select().from(compass).limit(1)
  const c = data[0] || null

  const parsed = c ? {
    id: c.id,
    northStar: c.northStar || '',
    purpose: c.purpose || '',
    currentReality: c.currentReality ? JSON.parse(c.currentReality) : { works: [], doesntWork: [], keyNumbers: [] },
    gaps: c.gaps ? JSON.parse(c.gaps) : [],
    strategicAnchors: c.strategicAnchors ? JSON.parse(c.strategicAnchors) : [],
    threeYearTarget: c.threeYearTarget ? JSON.parse(c.threeYearTarget) : null,
  } : null

  return <CompassEditor initial={parsed} />
}
