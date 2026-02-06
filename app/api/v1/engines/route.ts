import { db, initDB } from '@/lib/db'
import { engines } from '@/lib/db/schema'
import { jsonResponse } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

// GET /api/v1/engines
export async function GET() {
  initDB()
  const result = await db.select().from(engines)
  return jsonResponse(result)
}
