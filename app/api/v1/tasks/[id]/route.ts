import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { tasks, activityLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// GET /api/v1/tasks/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  const task = await db.select().from(tasks).where(eq(tasks.id, Number(params.id))).limit(1)
  if (!task[0]) return errorResponse('Task not found', 404)
  return jsonResponse(task[0])
}

// PUT /api/v1/tasks/:id — Update task
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  try {
    const body = await req.json()
    const existing = await db.select().from(tasks).where(eq(tasks.id, Number(params.id))).limit(1)
    if (!existing[0]) return errorResponse('Task not found', 404)

    const result = await db.update(tasks).set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.engine_id !== undefined && { engineId: body.engine_id }),
      ...(body.project_id !== undefined && { projectId: body.project_id }),
      ...(body.owner_id !== undefined && { ownerId: body.owner_id }),
      ...(body.reviewer_id !== undefined && { reviewerId: body.reviewer_id }),
      ...(body.milestone_id !== undefined && { milestoneId: body.milestone_id }),
      ...(body.estimated_hours !== undefined && { estimatedHours: body.estimated_hours }),
      ...(body.due_at !== undefined && { dueAt: body.due_at }),
      ...(body.impact !== undefined && { impact: body.impact }),
      ...(body.output !== undefined && { output: body.output }),
      ...(body.learnings !== undefined && { learnings: body.learnings }),
      ...(body.evaluation_rating !== undefined && { evaluationRating: body.evaluation_rating }),
      updatedAt: new Date().toISOString(),
    }).where(eq(tasks.id, Number(params.id))).returning()

    return jsonResponse(result[0])
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}

// DELETE /api/v1/tasks/:id — Archive task
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  const result = await db.update(tasks).set({
    status: 'archived',
    updatedAt: new Date().toISOString(),
  }).where(eq(tasks.id, Number(params.id))).returning()

  if (!result[0]) return errorResponse('Task not found', 404)

  await db.insert(activityLog).values({
    orgId: 1,
    action: 'task_archived',
    entityType: 'task',
    entityId: Number(params.id),
    description: `Task archived: ${result[0].title}`,
  })

  return jsonResponse(result[0])
}
