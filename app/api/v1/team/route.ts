import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { teamMembers, activityLog } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// GET /api/v1/team
export async function GET() {
  initDB()
  const result = await db.select().from(teamMembers).orderBy(teamMembers.name)
  return jsonResponse(result)
}

// POST /api/v1/team — Add member
export async function POST(req: NextRequest) {
  initDB()
  try {
    const body = await req.json()
    if (!body.name) return errorResponse('Name is required')
    if (!body.type) return errorResponse('Type is required (human or ai)')

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const result = await db.insert(teamMembers).values({
      orgId: 1,
      name: body.name,
      slug,
      type: body.type,
      roleId: body.role_id || null,
      status: body.status || 'active',
      email: body.email || null,
      timezone: body.timezone || null,
      avatarEmoji: body.avatar_emoji || null,
      aiModel: body.ai_model || null,
      aiConfig: body.ai_config ? JSON.stringify(body.ai_config) : null,
      openclawAgentId: body.openclaw_agent_id || null,
      costPerSession: body.cost_per_session || null,
      sessionsPerWeek: body.sessions_per_week || null,
      maxConcurrentTasks: body.max_concurrent_tasks || 3,
    }).returning()

    await db.insert(activityLog).values({
      orgId: 1,
      action: 'member_added',
      entityType: 'team_member',
      entityId: result[0].id,
      description: `Team member added: ${body.name} (${body.type})`,
    })

    return jsonResponse(result[0], 201)
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
