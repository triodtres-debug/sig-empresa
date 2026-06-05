'use client'

import { Modal } from './modal'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  loading?: boolean
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'flex-end' }}>
          <button className="btn btn-md btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn btn-md btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Excluindo...' : 'Sim, excluir'}
          </button>
        </div>
      }>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  )
}
