import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { scorecardMetrics, activityLog } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// GET /api/v1/scorecard
export async function GET() {
  initDB()
  const result = await db.select().from(scorecardMetrics).orderBy(scorecardMetrics.sortOrder)
  return jsonResponse(result)
}

// POST /api/v1/scorecard — Add metric
export async function POST(req: NextRequest) {
  initDB()
  try {
    const body = await req.json()
    if (!body.name) return errorResponse('Name is required')

    const result = await db.insert(scorecardMetrics).values({
      orgId: 1,
      name: body.name,
      description: body.description || null,
      category: body.category || 'north_star',
      engineId: body.engine_id || null,
      unit: body.unit || null,
      targetValue: body.target_value || null,
      currentValue: body.current_value || null,
      previousValue: body.previous_value || null,
      status: body.status || 'green',
      trend: body.trend || 'flat',
      thresholdGreen: body.threshold_green || null,
      thresholdYellow: body.threshold_yellow || null,
    }).returning()

    return jsonResponse(result[0], 201)
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
