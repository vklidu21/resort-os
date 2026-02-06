import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { memoryLogs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// GET /api/v1/memory/logs
export async function GET(req: NextRequest) {
  initDB()
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const logType = searchParams.get('type')

  let query = db.select().from(memoryLogs).orderBy(desc(memoryLogs.date))
  if (date) {
    const result = await db.select().from(memoryLogs).where(eq(memoryLogs.date, date))
    return jsonResponse(result)
  }
  if (logType) {
    const result = await db.select().from(memoryLogs).where(eq(memoryLogs.logType, logType)).orderBy(desc(memoryLogs.date))
    return jsonResponse(result)
  }

  const result = await db.select().from(memoryLogs).orderBy(desc(memoryLogs.date)).limit(30)
  return jsonResponse(result)
}

// POST /api/v1/memory/logs
export async function POST(req: NextRequest) {
  initDB()
  try {
    const body = await req.json()
    if (!body.content) return errorResponse('Content is required')

    const result = await db.insert(memoryLogs).values({
      orgId: 1,
      date: body.date || new Date().toISOString().slice(0, 10),
      authorId: body.author_id || null,
      content: body.content,
      logType: body.log_type || 'daily',
    }).returning()

    return jsonResponse(result[0], 201)
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
