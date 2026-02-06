import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.API_KEY || 'resort-os-dev-key-change-me'

export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const auth = req.headers.get('authorization')
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice(7)
      if (token !== API_KEY) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }
    }
    // Web UI requests without auth header are allowed (no login in MVP)
    return handler(req)
  }
}

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
