import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { scorecardMetrics, activityLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// PUT /api/v1/scorecard/:id — Update metric
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  try {
    const body = await req.json()
    const existing = await db.select().from(scorecardMetrics).where(eq(scorecardMetrics.id, Number(params.id))).limit(1)
    if (!existing[0]) return errorResponse('Metric not found', 404)

    const result = await db.update(scorecardMetrics).set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.unit !== undefined && { unit: body.unit }),
      ...(body.target_value !== undefined && { targetValue: body.target_value }),
      ...(body.current_value !== undefined && {
        previousValue: existing[0].currentValue,
        currentValue: body.current_value,
      }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.trend !== undefined && { trend: body.trend }),
      updatedAt: new Date().toISOString(),
    }).where(eq(scorecardMetrics.id, Number(params.id))).returning()

    await db.insert(activityLog).values({
      orgId: 1,
      action: 'scorecard_updated',
      entityType: 'scorecard_metric',
      entityId: Number(params.id),
      description: `Metric updated: ${result[0].name}`,
    })

    return jsonResponse(result[0])
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
