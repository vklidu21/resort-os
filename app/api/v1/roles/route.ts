import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { roles, activityLog } from '@/lib/db/schema'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// GET /api/v1/roles
export async function GET() {
  initDB()
  const result = await db.select().from(roles).orderBy(roles.name)
  return jsonResponse(result)
}

// POST /api/v1/roles
export async function POST(req: NextRequest) {
  initDB()
  try {
    const body = await req.json()
    if (!body.name) return errorResponse('Name is required')

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const result = await db.insert(roles).values({
      orgId: 1,
      name: body.name,
      slug,
      engineId: body.engine_id || null,
      roleType: body.role_type || 'ai',
      purpose: body.purpose || null,
      accountabilities: body.accountabilities ? JSON.stringify(body.accountabilities) : null,
      boundaries: body.boundaries ? JSON.stringify(body.boundaries) : null,
      autonomyMatrix: body.autonomy_matrix ? JSON.stringify(body.autonomy_matrix) : null,
      kpis: body.kpis ? JSON.stringify(body.kpis) : null,
      reportsTo: body.reports_to || null,
    }).returning()

    await db.insert(activityLog).values({
      orgId: 1,
      action: 'role_created',
      entityType: 'role',
      entityId: result[0].id,
      description: `Role created: ${body.name}`,
    })

    return jsonResponse(result[0], 201)
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
