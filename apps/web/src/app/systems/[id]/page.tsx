'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/app/app-layout'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function SystemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [system, setSystem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', url: '' })
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    try {
      const s = await api.systems.get(id)
      setSystem(s)
      setForm({ name: s.name, description: s.description || '', url: s.url || '' })
    } catch {
      toast('error', 'Erro ao carregar aplicação')
      router.push('/systems')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      await api.systems.update(id, form)
      toast('success', 'Aplicação atualizada')
      setEditOpen(false)
      await load()
    } catch { toast('error', 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.systems.delete(id)
      toast('success', 'Aplicação excluída')
      router.push('/systems')
    } catch { toast('error', 'Erro ao excluir') }
    finally { setDeleting(false) }
  }

  if (loading) return <AppLayout><p style={{ color: 'var(--text-muted)', padding: 32 }}>Carregando...</p></AppLayout>
  if (!system) return <AppLayout><p style={{ color: 'var(--text-muted)', padding: 32 }}>Aplicação não encontrada</p></AppLayout>

  return (
    <AppLayout>
      <div className="breadcrumb">
        <a onClick={() => router.push('/systems')}>Aplicações</a>
        <span>/</span>
        <span>{system.name}</span>
      </div>

      <div className="detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 20 }}>
            <i className="ti ti-server"></i>
          </div>
          <div>
            <h1 style={{ margin: 0 }}>{system.name}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{system.url || 'Sem URL'}</p>
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
            <span className="detail-label">Descrição</span>
            <span style={{ lineHeight: 1.6 }}>{system.description || 'Sem descrição'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">URL</span>
            {system.url ? <a href={system.url} target="_blank" style={{ color: 'var(--accent)' }}>{system.url}</a> : '-'}
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-card-title">Sessão</div>
          <div className="detail-item">
            <span className="detail-label">Criado em</span>
            <span>{new Date(system.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Atualizado em</span>
            <span>{new Date(system.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Aplicação"
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
            <label className="label">Descrição</label>
            <textarea className="input" style={{ minHeight: 80 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">URL</label>
            <input className="input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Excluir Aplicação"
        message={`Tem certeza que deseja excluir "${system.name}"? Esta ação não pode ser desfeita.`}
        loading={deleting} />
    </AppLayout>
  )
}
