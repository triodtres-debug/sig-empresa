'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/app/app-layout'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'

function initials(name: string) {
  return name.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase()
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', isAdmin: false })
  const [saving, setSaving] = useState(false)
  const [actionOpen, setActionOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('employee')
    if (stored) setSession(JSON.parse(stored))
  }, [])

  async function load() {
    try {
      const emp = await api.employees.get(id)
      setEmployee(emp)
      setForm({ name: emp.name, email: emp.email, password: '', isAdmin: emp.isAdmin })
    } catch {
      toast('error', 'Erro ao carregar colaborador')
      router.push('/employees')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = { name: form.name, email: form.email, isAdmin: form.isAdmin }
      if (form.password) payload.password = form.password
      await api.employees.update(id, payload)
      toast('success', 'Colaborador atualizado')
      setEditOpen(false)
      await load()
    } catch (e: any) { toast('error', e.message || 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  async function handleDeactivate() {
    setActionLoading(true)
    try {
      await api.employees.update(id, { active: false })
      toast('success', 'Colaborador desativado')
      setActionOpen(false)
      router.push('/employees')
    } catch (e: any) { toast('error', e.message || 'Erro ao desativar') }
    finally { setActionLoading(false) }
  }

  async function handleHardDelete() {
    setActionLoading(true)
    try {
      await api.employees.delete(id)
      toast('success', 'Colaborador excluído permanentemente')
      setActionOpen(false)
      router.push('/employees')
    } catch (e: any) { toast('error', e.message || 'Erro ao excluir') }
    finally { setActionLoading(false) }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast('error', 'Arquivo muito grande. Máximo 2MB.'); return }
    const reader = new FileReader()
    reader.onload = () => { setPhotoPreview(reader.result as string); setPhotoModalOpen(true) }
    reader.readAsDataURL(file)
  }

  async function handlePhotoConfirm() {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setPhotoLoading(true)
    try {
      const result = await api.employees.updatePhoto(id, file)
      setEmployee((prev: any) => ({ ...prev, photo: result.photo }))
      const stored = localStorage.getItem('employee')
      if (stored) {
        const s = JSON.parse(stored)
        if (s.id === id) { s.photo = result.photo; localStorage.setItem('employee', JSON.stringify(s)); setSession(s) }
      }
      toast('success', 'Foto atualizada')
      setPhotoModalOpen(false)
      setPhotoPreview(null)
    } catch (e: any) { toast('error', e.message || 'Erro ao enviar foto') }
    finally { setPhotoLoading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  async function handlePhotoRemove() {
    setPhotoLoading(true)
    try {
      await api.employees.removePhoto(id)
      setEmployee((prev: any) => ({ ...prev, photo: null }))
      const stored = localStorage.getItem('employee')
      if (stored) {
        const s = JSON.parse(stored)
        if (s.id === id) { s.photo = null; localStorage.setItem('employee', JSON.stringify(s)); setSession(s) }
      }
      toast('success', 'Foto removida')
      setPhotoModalOpen(false)
    } catch (e: any) { toast('error', e.message || 'Erro ao remover foto') }
    finally { setPhotoLoading(false) }
  }

  if (loading) return <AppLayout><p style={{ color: 'var(--text-muted)', padding: 32 }}>Carregando...</p></AppLayout>
  if (!employee) return <AppLayout><p style={{ color: 'var(--text-muted)', padding: 32 }}>Colaborador não encontrado</p></AppLayout>

  const avatarSize = 80
  const avatarCommon = { width: avatarSize, height: avatarSize, borderRadius: 'var(--radius-full)' }

  return (
    <AppLayout>
      <div className="breadcrumb">
        <a onClick={() => router.push('/employees')}>Colaboradores</a>
        <span>/</span>
        <span>{employee.name}</span>
      </div>

      <div className="detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            {employee.photo ? (
              <img src={employee.photo} alt="" style={{ ...avatarCommon, objectFit: 'cover', border: '2px solid var(--border)' }} />
            ) : (
              <div style={{ ...avatarCommon, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 500, fontFamily: 'var(--font-display)', background: employee.isAdmin ? '#A855F7' : 'var(--border)', color: '#FFF' }}>
                {initials(employee.name)}
              </div>
            )}
            <button className="btn btn-icon" style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, background: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-full)' }}
              onClick={() => setPhotoModalOpen(true)} title="Alterar foto">
              <i className="ti ti-camera" style={{ fontSize: 14 }}></i>
            </button>
          </div>
          <div>
            <h1 style={{ margin: 0 }}>{employee.name}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{employee.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-md btn-secondary" onClick={() => setEditOpen(true)}>
            <i className="ti ti-edit" style={{ fontSize: 16 }}></i> Editar
          </button>
          {session?.id !== id && (
            <button className="btn btn-md btn-danger" onClick={() => setActionOpen(true)}>
              <i className="ti ti-trash" style={{ fontSize: 16 }}></i> Gerenciar
            </button>
          )}
          {session?.id === id && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>Você não pode gerenciar a própria conta</span>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-card-title">Informações</div>
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span>{employee.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CPF</span>
            <code>{employee.cpf}</code>
          </div>
          <div className="detail-item">
            <span className="detail-label">Perfil</span>
            {employee.isAdmin ? <span className="badge badge-admin">Admin</span> : <span className="badge">Operador</span>}
          </div>
          <div className="detail-item">
            <span className="detail-label">Grupos</span>
            <span>{employee.groups?.length ? employee.groups.map((g: any) => g.group?.name).join(', ') : 'Nenhum'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className="status-pill" style={{ color: employee.active ? 'var(--success)' : 'var(--text-muted)', background: employee.active ? 'var(--success-bg)' : 'var(--bg-subtle)' }}>
              <span className="status-dot" style={{ background: employee.active ? 'var(--success)' : 'var(--text-muted)' }}></span>
              {employee.active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-card-title">Sessão</div>
          <div className="detail-item">
            <span className="detail-label">Criado em</span>
            <span>{new Date(employee.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Atualizado em</span>
            <span>{new Date(employee.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <Modal open={photoModalOpen} onClose={() => { setPhotoModalOpen(false); setPhotoPreview(null); setDragOver(false) }} title="Foto do Colaborador" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" style={{ width: 200, height: 200, borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '3px solid var(--border)' }} />
            ) : employee.photo ? (
              <img src={employee.photo} alt="" style={{ width: 200, height: 200, borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '3px solid var(--border)' }} />
            ) : (
              <div style={{ width: 200, height: 200, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, fontWeight: 500, fontFamily: 'var(--font-display)', background: employee.isAdmin ? '#A855F7' : 'var(--border)', color: '#FFF' }}>
                {initials(employee.name)}
              </div>
            )}
          </div>

          <div
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
            onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setDragOver(false) }}
            onDrop={e => { e.preventDefault(); e.stopPropagation(); setDragOver(false); handleFileSelect({ target: { files: e.dataTransfer.files } } as any) }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'var(--accent-light)' : 'transparent',
              transition: 'all 150ms',
            }}>
            <i className="ti ti-cloud-upload" style={{ fontSize: 32, color: dragOver ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 8 }}></i>
            <p style={{ fontSize: 13, color: dragOver ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 500 }}>
              {dragOver ? 'Solte a foto aqui' : 'Arraste e solte a foto aqui'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>ou clique para selecionar (PNG, JPEG, WebP, GIF — até 2MB)</p>
          </div>

          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: 'none' }} onChange={handleFileSelect} />

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {photoPreview && (
              <button className="btn btn-md btn-primary" onClick={handlePhotoConfirm} disabled={photoLoading}>
                {photoLoading ? 'Enviando...' : 'Salvar foto'}
              </button>
            )}
            {!photoPreview && employee.photo && (
              <button className="btn btn-md btn-danger" onClick={handlePhotoRemove} disabled={photoLoading}>
                {photoLoading ? 'Removendo...' : <><i className="ti ti-trash" style={{ fontSize: 16 }}></i> Remover foto</>}
              </button>
            )}
          </div>
        </div>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Colaborador"
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
            <label className="label">Nova senha</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Deixe vazio para manter" />
          </div>
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.isAdmin} onChange={e => setForm({ ...form, isAdmin: e.target.checked })} style={{ cursor: 'pointer' }} />
              Administrador (acesso total)
            </label>
          </div>
        </div>
      </Modal>

      <Modal open={actionOpen} onClose={() => setActionOpen(false)} title={`Gerenciar: ${employee.name}`} size="sm" footer={null}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Selecione uma ação para <strong>{employee.name}</strong>:
          </p>
          <button className="btn btn-md btn-ghost" style={{ justifyContent: 'flex-start' }}
            disabled={actionLoading}
            onClick={handleDeactivate}>
            <i className="ti ti-user-off" style={{ fontSize: 16 }}></i>
            Desativar (remove acesso ao sistema)
          </button>
          <button className="btn btn-md btn-danger" style={{ justifyContent: 'flex-start' }}
            disabled={actionLoading}
            onClick={handleHardDelete}>
            <i className="ti ti-trash" style={{ fontSize: 16 }}></i>
            {actionLoading ? 'Aguarde...' : 'Excluir permanentemente'}
          </button>
        </div>
      </Modal>
    </AppLayout>
  )
}
