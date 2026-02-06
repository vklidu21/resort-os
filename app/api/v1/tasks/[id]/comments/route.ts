import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { taskComments } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// GET /api/v1/tasks/:id/comments
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  const comments = await db.select().from(taskComments)
    .where(eq(taskComments.taskId, Number(params.id)))
    .orderBy(desc(taskComments.createdAt))
  return jsonResponse(comments)
}

// POST /api/v1/tasks/:id/comments
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  try {
    const body = await req.json()
    if (!body.content) return errorResponse('Content is required')

    const result = await db.insert(taskComments).values({
      taskId: Number(params.id),
      authorId: body.author_id || null,
      content: body.content,
      confidence: body.confidence || null,
      autonomyLevel: body.autonomy_level || null,
    }).returning()

    return jsonResponse(result[0], 201)
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
