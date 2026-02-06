import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { lessonsLearned } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

export async function GET() {
  initDB()
  const result = await db.select().from(lessonsLearned).orderBy(desc(lessonsLearned.createdAt))
  return jsonResponse(result)
}

export async function POST(req: NextRequest) {
  initDB()
  try {
    const body = await req.json()
    if (!body.title) return errorResponse('Title is required')

    const result = await db.insert(lessonsLearned).values({
      orgId: 1,
      title: body.title,
      insight: body.insight || null,
      context: body.context || null,
      action: body.action || null,
      sourceTaskId: body.source_task_id || null,
      createdById: body.created_by_id || null,
    }).returning()

    return jsonResponse(result[0], 201)
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
