'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../app-layout'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface FormData {
  description: string; amount: string; type: string; systemId: string; employeeId: string; statusId: string; date: string
}
const emptyForm: FormData = { description: '', amount: '', type: '', systemId: '', employeeId: '', statusId: '', date: new Date().toISOString().split('T')[0] }

const typeOptions = [
  { value: 'SERVICE', label: 'Serviço' },
  { value: 'LICENSE', label: 'Licença' },
  { value: 'HOSTING', label: 'Hospedagem' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'OTHER', label: 'Outros' },
]

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [systems, setSystems] = useState<any[]>([])
  const [statuses, setStatuses] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    try {
      const [ex, em, sy, st] = await Promise.all([
        api.expenses.list(), api.employees.list(), api.systems.list(), api.statuses.list()
      ])
      setExpenses(ex); setEmployees(em); setSystems(sy); setStatuses(st)
    } catch { toast('error', 'Erro ao carregar dados') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(ex: any) {
    setEditing(ex)
    setForm({
      description: ex.description, amount: String(ex.amount), type: ex.type || '',
      systemId: ex.systemId || '', employeeId: ex.employeeId || '', statusId: ex.statusId || '',
      date: ex.date ? ex.date.split('T')[0] : new Date().toISOString().split('T')[0],
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        description: form.description,
        amount: parseFloat(form.amount),
        date: form.date || new Date().toISOString().split('T')[0],
        type: form.type || undefined,
        systemId: form.systemId || undefined,
        employeeId: form.employeeId || undefined,
        statusId: form.statusId || undefined,
      }
      if (editing) { await api.expenses.update(editing.id, payload); toast('success', 'Lançamento atualizado') }
      else { await api.expenses.create(payload as any); toast('success', 'Lançamento criado') }
      setModalOpen(false); await load()
    } catch { toast('error', 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.expenses.delete(deleteTarget.id)
      toast('success', 'Lançamento excluído')
      setDeleteTarget(null); await load()
    } catch { toast('error', 'Erro ao excluir') }
    finally { setDeleting(false) }
  }

  const filtered = expenses.filter((ex: any) =>
    ex.description.toLowerCase().includes(search.toLowerCase())
  )

  const employeeName = (id: string) => employees.find(e => e.id === id)?.name || id

  return (
    <AppLayout>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Lançamentos</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{expenses.length} registros</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={openCreate}>
          <i className="ti ti-plus" style={{ fontSize: 16 }}></i> Novo Lançamento
        </button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 320 }} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Tipo</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Data</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Nenhum lançamento encontrado</td></tr>
            ) : filtered.map((ex: any) => (
              <tr key={ex.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/expenses/${ex.id}`)}>
                <td><span style={{ fontWeight: 500 }}>{ex.description}</span></td>
                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{parseFloat(ex.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
                <td>{ex.type ? <span className={`badge badge-${ex.type.toLowerCase()}`}>{typeOptions.find(t => t.value === ex.type)?.label || ex.type}</span> : '-'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{ex.employeeId ? employeeName(ex.employeeId) : '-'}</td>
                <td><span className="status-pill"><span className="status-dot" style={{ background: ex.status?.color || 'var(--text-muted)' }}></span>{ex.status?.name || '-'}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(ex.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-icon" onClick={() => openEdit(ex)}><i className="ti ti-edit" style={{ fontSize: 16 }}></i></button>
                    <button className="btn btn-icon" onClick={() => setDeleteTarget(ex)}><i className="ti ti-trash" style={{ fontSize: 16, color: 'var(--danger)' }}></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Lançamento' : 'Novo Lançamento'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <button className="btn btn-md btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-md btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Descrição</label>
            <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Valor (R$)</label>
              <input className="input" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="">Selecione...</option>
                {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Data</label>
            <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
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

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Lançamento"
        message={`Tem certeza que deseja excluir o lançamento "${deleteTarget?.description}"? Esta ação não pode ser desfeita.`}
        loading={deleting} />
    </AppLayout>
  )
}
