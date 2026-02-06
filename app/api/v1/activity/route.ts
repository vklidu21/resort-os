import { db, initDB } from '@/lib/db'
import { activityLog } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { jsonResponse } from '@/lib/api/middleware'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/v1/activity
export async function GET(req: NextRequest) {
  initDB()
  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get('limit') || '50')

  const result = await db.select().from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)
  return jsonResponse(result)
}
