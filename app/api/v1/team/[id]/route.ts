import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { teamMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// GET /api/v1/team/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  const member = await db.select().from(teamMembers).where(eq(teamMembers.id, Number(params.id))).limit(1)
  if (!member[0]) return errorResponse('Member not found', 404)
  return jsonResponse(member[0])
}

// PUT /api/v1/team/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  try {
    const body = await req.json()
    const existing = await db.select().from(teamMembers).where(eq(teamMembers.id, Number(params.id))).limit(1)
    if (!existing[0]) return errorResponse('Member not found', 404)

    const result = await db.update(teamMembers).set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.role_id !== undefined && { roleId: body.role_id }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.timezone !== undefined && { timezone: body.timezone }),
      ...(body.avatar_emoji !== undefined && { avatarEmoji: body.avatar_emoji }),
      ...(body.ai_model !== undefined && { aiModel: body.ai_model }),
      ...(body.ai_config !== undefined && { aiConfig: JSON.stringify(body.ai_config) }),
      ...(body.openclaw_agent_id !== undefined && { openclawAgentId: body.openclaw_agent_id }),
      ...(body.cost_per_session !== undefined && { costPerSession: body.cost_per_session }),
      ...(body.sessions_per_week !== undefined && { sessionsPerWeek: body.sessions_per_week }),
      ...(body.max_concurrent_tasks !== undefined && { maxConcurrentTasks: body.max_concurrent_tasks }),
      updatedAt: new Date().toISOString(),
    }).where(eq(teamMembers.id, Number(params.id))).returning()

    return jsonResponse(result[0])
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
