// In-memory server log buffer used for development only
// Keep this minimal — it's intended to help local debugging and should not be relied
// upon in production (process restarts will clear it).

type DevLog = {
  id: string
  level: "info" | "warn" | "error"
  message: string
  meta?: any
  ts: string
}

const MAX_LOGS = 100
let buffer: DevLog[] = []

export function addDevLog(level: DevLog['level'], message: string, meta?: any) {
  if (process.env.NODE_ENV !== 'development') return
  const log: DevLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level,
    message,
    meta,
    ts: new Date().toISOString(),
  }

  buffer.unshift(log)
  if (buffer.length > MAX_LOGS) buffer = buffer.slice(0, MAX_LOGS)
}

export function getDevLogs() {
  return buffer
}

export function clearDevLogs() {
  buffer = []
}
