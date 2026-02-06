import { NextRequest } from 'next/server'
import { db, initDB } from '@/lib/db'
import { roles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// GET /api/v1/roles/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  const role = await db.select().from(roles).where(eq(roles.id, Number(params.id))).limit(1)
  if (!role[0]) return errorResponse('Role not found', 404)
  return jsonResponse(role[0])
}

// PUT /api/v1/roles/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  initDB()
  try {
    const body = await req.json()
    const existing = await db.select().from(roles).where(eq(roles.id, Number(params.id))).limit(1)
    if (!existing[0]) return errorResponse('Role not found', 404)

    const result = await db.update(roles).set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.engine_id !== undefined && { engineId: body.engine_id }),
      ...(body.role_type !== undefined && { roleType: body.role_type }),
      ...(body.purpose !== undefined && { purpose: body.purpose }),
      ...(body.accountabilities !== undefined && { accountabilities: JSON.stringify(body.accountabilities) }),
      ...(body.boundaries !== undefined && { boundaries: JSON.stringify(body.boundaries) }),
      ...(body.autonomy_matrix !== undefined && { autonomyMatrix: JSON.stringify(body.autonomy_matrix) }),
      ...(body.kpis !== undefined && { kpis: JSON.stringify(body.kpis) }),
      ...(body.reports_to !== undefined && { reportsTo: body.reports_to }),
      ...(body.status !== undefined && { status: body.status }),
      updatedAt: new Date().toISOString(),
    }).where(eq(roles.id, Number(params.id))).returning()

    return jsonResponse(result[0])
  } catch (e) {
    return errorResponse('Invalid request body')
  }
}
