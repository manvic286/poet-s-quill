"use client"

import React, { useEffect, useState } from 'react'

type DevLog = {
  id: string
  level: 'info' | 'warn' | 'error'
  message: string
  meta?: any
  ts: string
}

export default function DevOverlay() {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<DevLog[]>([])
  const [config, setConfig] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const [logsRes, confRes] = await Promise.all([
        fetch('/api/dev/logs').then((r) => (r.ok ? r.json() : { logs: [] })),
        fetch('/api/dev/config').then((r) => (r.ok ? r.json() : { config: {} })),
      ])
      setLogs(logsRes.logs || [])
      setConfig(confRes.config || {})
    } catch (err) {
      console.error('dev overlay fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 2500)
    return () => clearInterval(id)
  }, [])

  async function clearLogs() {
    try {
      await fetch('/api/dev/logs', { method: 'DELETE' })
      setLogs([])
    } catch (err) {
      console.error('failed to clear logs', err)
    }
  }

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 9999 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => setOpen((s) => !s)}
          title="Toggle developer overlay"
          style={{
            background: '#0f172a',
            color: 'white',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            boxShadow: '0 6px 18px rgba(2,6,23,0.35)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Dev
        </button>
        {open && (
          <div style={{ width: 520, maxHeight: 420, background: 'rgba(8,8,10,0.95)', color: 'white', borderRadius: 8, padding: 12, boxShadow: '0 12px 40px rgba(2,6,23,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Developer overlay (dev only)</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={fetchData} style={{ padding: 6, fontSize: 12 }}>Refresh</button>
                <button onClick={clearLogs} style={{ padding: 6, fontSize: 12 }}>Clear logs</button>
              </div>
            </div>

            <section style={{ marginTop: 8, fontSize: 12 }}>
              <strong>Server env presence</strong>
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                {Object.entries(config).map(([k, v]) => (
                  <div key={k} style={{ fontSize: 12 }}>
                    <div style={{ opacity: 0.8 }}>{k}</div>
                    <div style={{ color: v ? '#86efac' : '#fda4af' }}>{String(v)}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ marginTop: 12 }}>
              <strong style={{ fontSize: 12 }}>Recent server logs (most recent first)</strong>
              <div style={{ maxHeight: 280, overflow: 'auto', marginTop: 8 }}>
                {loading && <div style={{ opacity: 0.8 }}>Loading…</div>}
                {!loading && logs.length === 0 && <div style={{ opacity: 0.6 }}>No logs</div>}
                {logs.map((l) => (
                  <div key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ color: l.level === 'error' ? '#fb7185' : '#93c5fd', fontSize: 13 }}>{l.level.toUpperCase()}</div>
                      <div style={{ opacity: 0.6, fontSize: 11 }}>{new Date(l.ts).toLocaleTimeString()}</div>
                    </div>
                    <div style={{ marginTop: 6, whiteSpace: 'pre-wrap', fontSize: 12 }}>{l.message}</div>
                    {l.meta && <pre style={{ fontSize: 11, opacity: 0.75, marginTop: 6, background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 4 }}>{JSON.stringify(l.meta, null, 2)}</pre>}
                  </div>
                ))}
              </div>
            </section>

            <footer style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ opacity: 0.6, fontSize: 11 }}>Only visible when NODE_ENV=development</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    const text = logs.map((l) => `${l.ts} ${l.level} ${l.message}\n${JSON.stringify(l.meta || {}, null, 2)}`).join('\n\n')
                    navigator.clipboard?.writeText(text).then(() => {
                      // copied
                    })
                  }}
                  style={{ padding: 6, fontSize: 12 }}
                >
                  Copy
                </button>
                <button onClick={() => setOpen(false)} style={{ padding: 6, fontSize: 12 }}>Close</button>
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  )
}
