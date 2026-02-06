import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { compass, activityLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// GET /api/v1/compass
export async function GET() {
  initDB()
  const result = await db.select().from(compass).limit(1)
  if (!result[0]) {
    // Create default compass
    const created = await db.insert(compass).values({ orgId: 1 }).returning()
    return jsonResponse(created[0])
  }
  return jsonResponse(result[0])
}

// PUT /api/v1/compass
export async function PUT(req: NextRequest) {
  initDB()
  try {
    const body = await req.json()
    const existing = await db.select().from(compass).limit(1)

    let result
    if (existing[0]) {
      result = await db.update(compass).set({
        ...(body.north_star !== undefined && { northStar: body.north_star }),
        ...(body.purpose !== undefined && { purpose: body.purpose }),
        ...(body.current_reality !== undefined && { currentReality: JSON.stringify(body.current_reality) }),
        ...(body.gaps !== undefined && { gaps: JSON.stringify(body.gaps) }),
        ...(body.strategic_anchors !== undefined && { strategicAnchors: JSON.stringify(body.strategic_anchors) }),
        ...(body.three_year_target !== undefined && { threeYearTarget: JSON.stringify(body.three_year_target) }),
        ...(body.investment_phases !== undefined && { investmentPhases: JSON.stringify(body.investment_phases) }),
        updatedAt: new Date().toISOString(),
      }).where(eq(compass.id, existing[0].id)).returning()
    } else {
      result = await db.insert(compass).values({
        orgId: 1,
        northStar: body.north_star || null,
        purpose: body.purpose || null,
        currentReality: body.current_reality ? JSON.stringify(body.current_reality) : null,
        gaps: body.gaps ? JSON.stringify(body.gaps) : null,
        strategicAnchors: body.strategic_anchors ? JSON.stringify(body.strategic_anchors) : null,
        threeYearTarget: body.three_year_target ? JSON.stringify(body.three_year_target) : null,
        investmentPhases: body.investment_phases ? JSON.stringify(body.investment_phases) : null,
      }).returning()
    }

    await db.insert(activityLog).values({
      orgId: 1,
      action: 'compass_updated',
      entityType: 'compass',
      entityId: result[0].id,
      description: 'Compass updated',
    })

    return jsonResponse(result[0])
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
