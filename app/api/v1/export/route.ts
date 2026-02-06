import { NextRequest } from 'next/server'
import { jsonResponse, errorResponse } from '@/lib/api/middleware'
import { exportAllMarkdown } from '@/lib/markdown/exporter'

export const dynamic = 'force-dynamic'

// POST /api/v1/export — Trigger markdown export
export async function POST(_req: NextRequest) {
  try {
    exportAllMarkdown()
    return jsonResponse({ success: true, message: 'Markdown exported' })
  } catch (e: any) {
    return errorResponse(`Export failed: ${e.message}`, 500)
  }
}
