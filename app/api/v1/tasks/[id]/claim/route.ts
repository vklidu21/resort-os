import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { tasks, activityLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// POST /api/v1/tasks/:id/claim — Agent claims an unassigned task
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  try {
    const body = await req.json()
    if (!body.agent_id) return errorResponse('agent_id is required')

    const existing = await db.select().from(tasks).where(eq(tasks.id, Number(params.id))).limit(1)
    if (!existing[0]) return errorResponse('Task not found', 404)
    if (existing[0].ownerId) return errorResponse('Task is already assigned')
    if (existing[0].status !== 'backlog') return errorResponse('Can only claim backlog tasks')

    const result = await db.update(tasks).set({
      ownerId: body.agent_id,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).where(eq(tasks.id, Number(params.id))).returning()

    await db.insert(activityLog).values({
      orgId: 1,
      actorId: body.agent_id,
      action: 'task_claimed',
      entityType: 'task',
      entityId: Number(params.id),
      description: `Task claimed: ${existing[0].title}`,
      autonomyLevel: 'L1',
    })

    return jsonResponse(result[0])
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
