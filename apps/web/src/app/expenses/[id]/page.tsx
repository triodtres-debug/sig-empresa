'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/app/app-layout'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const typeOptions: Record<string, string> = {
  SERVICE: 'Serviço', LICENSE: 'Licença', HOSTING: 'Hospedagem',
  SOFTWARE: 'Software', HARDWARE: 'Hardware', OTHER: 'Outros',
}

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [expense, setExpense] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [systems, setSystems] = useState<any[]>([])
  const [statuses, setStatuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({ description: '', amount: '', type: '', systemId: '', employeeId: '', statusId: '' })
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    try {
      const [ex, em, sy, st] = await Promise.all([
        api.expenses.get(id), api.employees.list(), api.systems.list(), api.statuses.list()
      ])
      setExpense(ex); setEmployees(em); setSystems(sy); setStatuses(st)
      setForm({
        description: ex.description, amount: String(ex.amount), type: ex.type || '',
        systemId: ex.systemId || '', employeeId: ex.employeeId || '', statusId: ex.statusId || '',
      })
    } catch {
      toast('error', 'Erro ao carregar lançamento')
      router.push('/expenses')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      await api.expenses.update(id, {
        description: form.description,
        amount: parseFloat(form.amount),
        type: form.type || undefined,
        systemId: form.systemId || undefined,
        employeeId: form.employeeId || undefined,
        statusId: form.statusId || undefined,
      })
      toast('success', 'Lançamento atualizado')
      setEditOpen(false)
      await load()
    } catch { toast('error', 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.expenses.delete(id)
      toast('success', 'Lançamento excluído')
      router.push('/expenses')
    } catch { toast('error', 'Erro ao excluir') }
    finally { setDeleting(false) }
  }

  if (loading) return <AppLayout><p style={{ color: 'var(--text-muted)', padding: 32 }}>Carregando...</p></AppLayout>
  if (!expense) return <AppLayout><p style={{ color: 'var(--text-muted)', padding: 32 }}>Lançamento não encontrado</p></AppLayout>

  return (
    <AppLayout>
      <div className="breadcrumb">
        <a onClick={() => router.push('/expenses')}>Lançamentos</a>
        <span>/</span>
        <span>{expense.description}</span>
      </div>

      <div className="detail-header">
        <div>
          <h1 style={{ margin: 0 }}>{expense.description}</h1>
          <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
            {parseFloat(expense.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-md btn-secondary" onClick={() => setEditOpen(true)}>
            <i className="ti ti-edit" style={{ fontSize: 16 }}></i> Editar
          </button>
          <button className="btn btn-md btn-danger" onClick={() => setDeleteOpen(true)}>
            <i className="ti ti-trash" style={{ fontSize: 16 }}></i> Excluir
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-card-title">Informações</div>
          <div className="detail-item">
            <span className="detail-label">Tipo</span>
            <span>{expense.type ? <span className="badge">{typeOptions[expense.type] || expense.type}</span> : '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Valor</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {parseFloat(expense.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className="status-pill">
              <span className="status-dot" style={{ background: expense.status?.color || 'var(--text-muted)' }}></span>
              {expense.status?.name || '-'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Responsável</span>
            <span>{expense.employee ? expense.employee.name : (employees.find(e => e.id === expense.employeeId)?.name || '-')}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Aplicação</span>
            <span>{expense.system ? expense.system.name : (systems.find(s => s.id === expense.systemId)?.name || '-')}</span>
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-card-title">Sessão</div>
          <div className="detail-item">
            <span className="detail-label">Criado em</span>
            <span>{new Date(expense.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Atualizado em</span>
            <span>{new Date(expense.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Lançamento"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <button className="btn btn-md btn-secondary" onClick={() => setEditOpen(false)}>Cancelar</button>
            <button className="btn btn-md btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Descrição</label>
            <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Valor (R$)</label>
              <input className="input" type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="">Selecione...</option>
                {Object.entries(typeOptions).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Responsável</label>
              <select className="input" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
                <option value="">Selecione...</option>
                {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.statusId} onChange={e => setForm({ ...form, statusId: e.target.value })}>
                <option value="">Selecione...</option>
                {statuses.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Aplicação</label>
            <select className="input" value={form.systemId} onChange={e => setForm({ ...form, systemId: e.target.value })}>
              <option value="">Selecione...</option>
              {systems.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Excluir Lançamento"
        message={`Tem certeza que deseja excluir o lançamento "${expense.description}"? Esta ação não pode ser desfeita.`}
        loading={deleting} />
    </AppLayout>
  )
}
