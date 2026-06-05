'use client'

import { useState, useCallback, useEffect } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

const icons: Record<string, string> = {
  success: 'ti ti-circle-check',
  error: 'ti ti-circle-x',
  warning: 'ti ti-alert-triangle',
  info: 'ti ti-info-circle',
}

const colors: Record<string, string> = {
  success: 'var(--success)',
  error: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--info)',
}

const bgs: Record<string, string> = {
  success: 'var(--success-bg)',
  error: 'var(--danger-bg)',
  warning: 'var(--warning-bg)',
  info: 'var(--info-bg)',
}

let addToastFn: ((t: Omit<Toast, 'id'>) => void) | null = null

export function toast(type: Toast['type'], message: string) {
  addToastFn?.({ type, message })
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev.slice(-2), { ...t, id }])
    if (t.type !== 'error') {
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000)
    }
  }, [])

  useEffect(() => { addToastFn = add }, [add])

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 'var(--z-toast)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 'var(--radius-md)',
          background: bgs[t.type], border: `1px solid ${colors[t.type]}`,
          fontSize: 13, color: colors[t.type], minWidth: 280,
          animation: 'slideUp 200ms', boxShadow: 'var(--shadow-md)',
        }}>
          <i className={icons[t.type]} style={{ fontSize: 18, flexShrink: 0 }}></i>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button className="btn btn-icon" style={{ width: 24, height: 24 }} onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
            <i className="ti ti-x" style={{ fontSize: 14 }}></i>
          </button>
        </div>
      ))}
    </div>
  )
}
