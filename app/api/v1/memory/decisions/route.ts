import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { decisionRecords } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

export async function GET() {
  initDB()
  const result = await db.select().from(decisionRecords).orderBy(desc(decisionRecords.createdAt))
  return jsonResponse(result)
}

export async function POST(req: NextRequest) {
  initDB()
  try {
    const body = await req.json()
    if (!body.title) return errorResponse('Title is required')

    const result = await db.insert(decisionRecords).values({
      orgId: 1,
      title: body.title,
      context: body.context || null,
      options: body.options ? JSON.stringify(body.options) : null,
      decision: body.decision || null,
      reasoning: body.reasoning || null,
      outcome: body.outcome || null,
      decidedById: body.decided_by_id || null,
      decidedAt: body.decided_at || null,
    }).returning()

    return jsonResponse(result[0], 201)
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
