import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { tasks, activityLog } from '@/lib/db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// GET /api/v1/tasks — List tasks with filters
export async function GET(req: NextRequest) {
  initDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const engineId = searchParams.get('engine_id')
  const ownerId = searchParams.get('owner_id')
  const priority = searchParams.get('priority')

  const conditions = []
  if (status) conditions.push(eq(tasks.status, status))
  if (engineId) conditions.push(eq(tasks.engineId, Number(engineId)))
  if (ownerId) conditions.push(eq(tasks.ownerId, Number(ownerId)))
  if (priority) conditions.push(eq(tasks.priority, priority))

  const result = conditions.length > 0
    ? await db.select().from(tasks).where(and(...conditions)).orderBy(tasks.sortOrder, desc(tasks.createdAt))
    : await db.select().from(tasks).orderBy(tasks.sortOrder, desc(tasks.createdAt))

  return jsonResponse(result)
}

// POST /api/v1/tasks — Create task
export async function POST(req: NextRequest) {
  initDB()
  try {
    const body = await req.json()
    if (!body.title) return errorResponse('Title is required')

    const result = await db.insert(tasks).values({
      orgId: body.org_id || 1,
      title: body.title,
      description: body.description || null,
      status: body.status || 'inbox',
      priority: body.priority || 'medium',
      engineId: body.engine_id || null,
      projectId: body.project_id || null,
      ownerId: body.owner_id || null,
      milestoneId: body.milestone_id || null,
      estimatedHours: body.estimated_hours || null,
      dueAt: body.due_at || null,
    }).returning()

    // Log activity
    await db.insert(activityLog).values({
      orgId: 1,
      actorId: body.owner_id || null,
      action: 'task_created',
      entityType: 'task',
      entityId: result[0].id,
      description: `Task created: ${body.title}`,
    })

    return jsonResponse(result[0], 201)
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
