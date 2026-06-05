'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../app-layout'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface FormData {
  name: string; email: string; cpf: string; password: string; isAdmin: boolean
}

const emptyForm: FormData = { name: '', email: '', cpf: '', password: '', isAdmin: false }

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('employee')
    if (stored) setSession(JSON.parse(stored))
  }, [])

  async function load() {
    try { setEmployees(await api.employees.list()) }
    catch { toast('error', 'Erro ao carregar colaboradores') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(e: any) {
    setEditing(e)
    setForm({ name: e.name, email: e.email, cpf: e.cpf, password: '', isAdmin: e.isAdmin })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) {
        const payload: Record<string, unknown> = { name: form.name, email: form.email, isAdmin: form.isAdmin }
        if (form.password) payload.password = form.password
        await api.employees.update(editing.id, payload)
        toast('success', 'Colaborador atualizado')
      } else {
        await api.employees.create(form)
        toast('success', 'Colaborador criado')
      }
      setModalOpen(false)
      await load()
    } catch (e: any) { toast('error', e.message || 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  async function handleDeactivate() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.employees.update(deleteTarget.id, { active: false })
      toast('success', 'Colaborador desativado')
      setDeleteTarget(null)
      await load()
    } catch (e: any) { toast('error', e.message || 'Erro ao desativar') }
    finally { setDeleting(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.employees.delete(deleteTarget.id)
      toast('success', 'Colaborador excluído permanentemente')
      setDeleteTarget(null)
      await load()
    } catch (e: any) { toast('error', e.message || 'Erro ao excluir') }
    finally { setDeleting(false) }
  }

  const filtered = employees.filter((e: any) =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.email.includes(search)
  )

  return (
    <AppLayout>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Colaboradores</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{employees.length} registros</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={openCreate}>
          <i className="ti ti-plus" style={{ fontSize: 16 }}></i>
          Novo Colaborador
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 320 }} placeholder="Buscar por nome ou email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>CPF</th>
              <th>Perfil</th>
              <th>Status</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Nenhum colaborador encontrado</td></tr>
            ) : filtered.map((e: any) => (
              <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/employees/${e.id}`)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {e.photo ? (
                      <img src={e.photo} alt="" className="avatar avatar-sm" style={{ objectFit: 'cover', background: 'var(--surface)' }} />
                    ) : (
                      <div className="avatar avatar-sm" style={{ background: e.isAdmin ? '#A855F7' : 'var(--border)', color: '#FFF' }}>
                        {e.name.split(' ').map((s: string) => s[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <span style={{ fontWeight: 500 }}>{e.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{e.email}</td>
                <td><code>{e.cpf}</code></td>
                <td>{e.isAdmin ? <span className="badge badge-admin">Admin</span> : <span className="badge">Operador</span>}</td>
                <td>
                  <span className="status-pill" style={{ color: e.active ? 'var(--success)' : 'var(--text-muted)', background: e.active ? 'var(--success-bg)' : 'var(--bg-subtle)' }}>
                    <span className="status-dot" style={{ background: e.active ? 'var(--success)' : 'var(--text-muted)' }}></span>
                    {e.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-icon" onClick={() => openEdit(e)}><i className="ti ti-edit" style={{ fontSize: 16 }}></i></button>
                    <button className="btn btn-icon" onClick={() => setDeleteTarget(e)}><i className="ti ti-trash" style={{ fontSize: 16, color: 'var(--danger)' }}></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Colaborador' : 'Novo Colaborador'}
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
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">CPF</label>
            <input className="input" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} disabled={!!editing} required />
          </div>
          {!editing && (
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
          )}
          {editing && (
            <div>
              <label className="label">Nova senha (deixe vazio para manter)</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          )}
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.isAdmin} onChange={e => setForm({ ...form, isAdmin: e.target.checked })} style={{ cursor: 'pointer' }} />
              Administrador (acesso total)
            </label>
          </div>
        </div>
      </Modal>

      {deleteTarget && (
        <Modal open={true} onClose={() => setDeleteTarget(null)} title={`Gerenciar: ${deleteTarget.name}`} size="sm"
          footer={null}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Selecione uma ação para <strong>{deleteTarget.name}</strong>:
            </p>
            <button className="btn btn-md btn-ghost" style={{ justifyContent: 'flex-start' }}
              disabled={deleteTarget.id === session?.id}
              title={deleteTarget.id === session?.id ? 'Não é permitido desativar a própria conta.' : undefined}
              onClick={handleDeactivate}>
              <i className="ti ti-user-off" style={{ fontSize: 16 }}></i>
              Desativar (remove acesso ao sistema)
            </button>
            <button className="btn btn-md btn-danger" style={{ justifyContent: 'flex-start' }}
              onClick={handleDelete}>
              <i className="ti ti-trash" style={{ fontSize: 16 }}></i>
              Excluir permanentemente
            </button>
          </div>
        </Modal>
      )}
    </AppLayout>
  )
}
