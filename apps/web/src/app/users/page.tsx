'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../app-layout'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface FormData {
  name: string; email: string; login: string; systemId: string; employeeId: string
}
const emptyForm: FormData = { name: '', email: '', login: '', systemId: '', employeeId: '' }

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [systems, setSystems] = useState<any[]>([])
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
      const [u, e, s] = await Promise.all([
        api.users.list(), api.employees.list(), api.systems.list()
      ])
      setUsers(u); setEmployees(e); setSystems(s)
    } catch { toast('error', 'Erro ao carregar dados') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(u: any) {
    setEditing(u)
    setForm({
      name: u.name, email: u.email || '', login: u.login || '',
      systemId: u.systemId || '', employeeId: u.employeeId || '',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {}
      if (form.name) payload.name = form.name
      if (form.email) payload.email = form.email
      if (form.login) payload.login = form.login
      if (form.systemId) payload.systemId = form.systemId
      if (form.employeeId) payload.employeeId = form.employeeId
      if (editing) { await api.users.update(editing.id, payload); toast('success', 'Conta atualizada') }
      else { await api.users.create(payload as any); toast('success', 'Conta criada') }
      setModalOpen(false); await load()
    } catch { toast('error', 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.users.delete(deleteTarget.id)
      toast('success', 'Conta excluída')
      setDeleteTarget(null); await load()
    } catch { toast('error', 'Erro ao excluir') }
    finally { setDeleting(false) }
  }

  const filtered = users.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email?.includes(search)
  )

  const systemName = (id: string) => systems.find(s => s.id === id)?.name || id
  const employeeName = (id: string) => employees.find(e => e.id === id)?.name || id

  return (
    <AppLayout>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Contas Vinculadas</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{users.length} registros</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={openCreate}>
          <i className="ti ti-plus" style={{ fontSize: 16 }}></i> Nova Conta
        </button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 320 }} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Login</th>
              <th>Aplicação</th>
              <th>Colaborador</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Nenhuma conta encontrada</td></tr>
            ) : filtered.map((u: any) => (
              <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/users/${u.id}`)}>
                <td><span style={{ fontWeight: 500 }}>{u.name}</span></td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.email || '-'}</td>
                <td><code>{u.login || '-'}</code></td>
                <td>{u.systemId ? <span className="badge badge-info">{systemName(u.systemId)}</span> : '-'}</td>
                <td>{u.employeeId ? employeeName(u.employeeId) : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-icon" onClick={() => openEdit(u)}><i className="ti ti-edit" style={{ fontSize: 16 }}></i></button>
                    <button className="btn btn-icon" onClick={() => setDeleteTarget(u)}><i className="ti ti-trash" style={{ fontSize: 16, color: 'var(--danger)' }}></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Conta' : 'Nova Conta'}
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
            <label className="label">Nome</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Login</label>
            <input className="input" value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} />
          </div>
          <div>
            <label className="label">Aplicação</label>
            <select className="input" value={form.systemId} onChange={e => setForm({ ...form, systemId: e.target.value })}>
              <option value="">Selecione...</option>
              {systems.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Colaborador Responsável</label>
            <select className="input" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
              <option value="">Selecione...</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Conta"
        message={`Tem certeza que deseja excluir a conta "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleting} />
    </AppLayout>
  )
}
