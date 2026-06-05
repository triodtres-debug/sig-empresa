'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/app/app-layout'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [systems, setSystems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', login: '', systemId: '', employeeId: '' })
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    try {
      const [u, e, s] = await Promise.all([api.users.get(id), api.employees.list(), api.systems.list()])
      setUser(u); setEmployees(e); setSystems(s)
      setForm({ name: u.name, email: u.email || '', login: u.login || '', systemId: u.systemId || '', employeeId: u.employeeId || '' })
    } catch {
      toast('error', 'Erro ao carregar conta')
      router.push('/users')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { name: form.name, email: form.email || undefined, login: form.login || undefined }
      if (form.systemId) payload.systemId = form.systemId
      if (form.employeeId) payload.employeeId = form.employeeId
      await api.users.update(id, payload)
      toast('success', 'Conta atualizada')
      setEditOpen(false)
      await load()
    } catch { toast('error', 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.users.delete(id)
      toast('success', 'Conta excluída')
      router.push('/users')
    } catch { toast('error', 'Erro ao excluir') }
    finally { setDeleting(false) }
  }

  if (loading) return <AppLayout><p style={{ color: 'var(--text-muted)', padding: 32 }}>Carregando...</p></AppLayout>
  if (!user) return <AppLayout><p style={{ color: 'var(--text-muted)', padding: 32 }}>Conta não encontrada</p></AppLayout>

  const systemName = systems.find(s => s.id === user.systemId)?.name
  const employeeName = employees.find(e => e.id === user.employeeId)?.name

  return (
    <AppLayout>
      <div className="breadcrumb">
        <a onClick={() => router.push('/users')}>Contas Vinculadas</a>
        <span>/</span>
        <span>{user.name}</span>
      </div>

      <div className="detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="avatar" style={{ background: 'var(--accent)', color: '#FFF' }}>
            {user.name.split(' ').map((s: string) => s[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h1 style={{ margin: 0 }}>{user.name}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{user.email || 'Sem email'}</p>
          </div>
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
            <span className="detail-label">Email</span>
            <span>{user.email || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Login</span>
            <code>{user.login || '-'}</code>
          </div>
          <div className="detail-item">
            <span className="detail-label">Aplicação</span>
            <span>{systemName ? <span className="badge badge-info">{systemName}</span> : '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Colaborador</span>
            <span>{employeeName || '-'}</span>
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-card-title">Sessão</div>
          <div className="detail-item">
            <span className="detail-label">Criado em</span>
            <span>{new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Atualizado em</span>
            <span>{new Date(user.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Conta"
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
            <label className="label">Nome</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
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
            <label className="label">Colaborador</label>
            <select className="input" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
              <option value="">Selecione...</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Excluir Conta"
        message={`Tem certeza que deseja excluir a conta "${user.name}"? Esta ação não pode ser desfeita.`}
        loading={deleting} />
    </AppLayout>
  )
}
