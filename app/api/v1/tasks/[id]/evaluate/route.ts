import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { tasks, lessonsLearned, activityLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// POST /api/v1/tasks/:id/evaluate — Evaluate a completed task
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  try {
    const body = await req.json()
    const existing = await db.select().from(tasks).where(eq(tasks.id, Number(params.id))).limit(1)
    if (!existing[0]) return errorResponse('Task not found', 404)
    if (existing[0].status !== 'done' && existing[0].status !== 'in_review') {
      return errorResponse('Can only evaluate done or in_review tasks')
    }

    // Update task with evaluation
    const result = await db.update(tasks).set({
      impact: body.impact || existing[0].impact,
      learnings: body.learnings || existing[0].learnings,
      evaluationRating: body.rating || existing[0].evaluationRating,
      status: body.approve === false ? 'in_progress' : 'done',
      updatedAt: new Date().toISOString(),
    }).where(eq(tasks.id, Number(params.id))).returning()

    // Create lesson learned if provided
    if (body.lesson_title && body.lesson_insight) {
      await db.insert(lessonsLearned).values({
        orgId: 1,
        title: body.lesson_title,
        insight: body.lesson_insight,
        context: body.lesson_context || null,
        action: body.lesson_action || null,
        sourceTaskId: Number(params.id),
        createdById: body.evaluator_id || null,
      })
    }

    await db.insert(activityLog).values({
      orgId: 1,
      actorId: body.evaluator_id || null,
      action: body.approve === false ? 'task_returned' : 'task_evaluated',
      entityType: 'task',
      entityId: Number(params.id),
      description: body.approve === false
        ? `Task returned: ${existing[0].title}`
        : `Task evaluated: ${existing[0].title} (${body.rating || '-'}/5)`,
    })

    return jsonResponse(result[0])
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
