import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { tasks, activityLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'
import { VALID_TRANSITIONS, type TaskStatus } from '@/lib/constants'

export const dynamic = 'force-dynamic'

// PATCH /api/v1/tasks/:id/status — Transition task status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  try {
    const body = await req.json()
    const newStatus = body.status as TaskStatus
    if (!newStatus) return errorResponse('Status is required')

    const existing = await db.select().from(tasks).where(eq(tasks.id, Number(params.id))).limit(1)
    if (!existing[0]) return errorResponse('Task not found', 404)

    const currentStatus = existing[0].status as TaskStatus
    const allowed = VALID_TRANSITIONS[currentStatus]
    if (!allowed?.includes(newStatus)) {
      return errorResponse(`Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowed?.join(', ')}`)
    }

    const updates: Record<string, unknown> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }

    if (newStatus === 'in_progress' && !existing[0].startedAt) {
      updates.startedAt = new Date().toISOString()
    }
    if (newStatus === 'done') {
      updates.completedAt = new Date().toISOString()
    }
    if (newStatus === 'blocked') {
      updates.blockedSince = new Date().toISOString()
      if (body.blocker_reason) updates.blockerReason = body.blocker_reason
    }
    if (currentStatus === 'blocked' && newStatus !== 'blocked') {
      updates.blockerReason = null
      updates.blockedSince = null
    }

    const result = await db.update(tasks).set(updates).where(eq(tasks.id, Number(params.id))).returning()

    await db.insert(activityLog).values({
      orgId: 1,
      action: 'task_status_changed',
      entityType: 'task',
      entityId: Number(params.id),
      description: `Task "${existing[0].title}" moved from ${currentStatus} to ${newStatus}`,
    })

    return jsonResponse(result[0])
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
