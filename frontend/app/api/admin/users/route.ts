import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001'

function parseJsonSafe(text: string) {
  if (!text || !text.trim()) {
    return { success: false, message: 'Empty response from backend' }
  }
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return {
      success: false,
      message: 'Invalid JSON from backend',
      detail: text.slice(0, 200)
    }
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: 'Authorization header required' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const qs = searchParams.toString()
  const url = `${BACKEND_URL}/api/users${qs ? `?${qs}` : ''}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    })

    const data = parseJsonSafe(await response.text())
    return NextResponse.json(data, { status: response.status })
  } catch (e) {
    console.error('Admin users proxy error:', e)
    return NextResponse.json(
      { success: false, message: 'Failed to reach backend' },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: 'Authorization header required' },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    })

    const data = parseJsonSafe(await response.text())
    return NextResponse.json(data, { status: response.status })
  } catch (e) {
    console.error('Admin users POST proxy error:', e)
    return NextResponse.json(
      { success: false, message: 'Failed to reach backend' },
      { status: 502 }
    )
  }
}
