'use client'

import { useEffect, useCallback } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ open, onClose, title, size = 'md', children, footer }: ModalProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, handleKey])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal modal-${size}`} onClick={e => e.stopPropagation()} style={{ animation: 'slideUp 200ms' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 16, fontWeight: 500 }}>{title}</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <i className="ti ti-x" style={{ fontSize: 20 }}></i>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
