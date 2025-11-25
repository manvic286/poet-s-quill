import { NextResponse } from 'next/server'
import { getDevLogs } from '@/lib/dev/logs'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not found', { status: 404 })
  }

  const logs = getDevLogs()
  return NextResponse.json({ logs })
}

export async function DELETE() {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const { clearDevLogs } = await import('@/lib/dev/logs')
    clearDevLogs()
    return NextResponse.json({ ok: true })
  } catch (err) {
    return new NextResponse('Failed', { status: 500 })
  }
}
