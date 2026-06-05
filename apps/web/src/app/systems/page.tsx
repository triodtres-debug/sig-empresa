'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../app-layout'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface FormData { name: string; description: string; baseUrl: string; slug: string }
const emptyForm: FormData = { name: '', description: '', baseUrl: '', slug: '' }

function slugify(text: string) { return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }

export default function SystemsPage() {
  const router = useRouter()
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
    try { setSystems(await api.systems.list()) }
    catch { toast('error', 'Erro ao carregar aplicações') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(s: any) { setEditing(s); setForm({ name: s.name, description: s.description || '', baseUrl: s.baseUrl || '', slug: s.slug }); setModalOpen(true) }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = { name: form.name, slug: editing ? form.slug : (form.slug || slugify(form.name)), description: form.description || undefined, baseUrl: form.baseUrl || undefined }
      if (editing) { await api.systems.update(editing.id, payload); toast('success', 'Aplicação atualizada') }
      else { await api.systems.create(payload); toast('success', 'Aplicação criada') }
      setModalOpen(false); await load()
    } catch { toast('error', 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.systems.delete(deleteTarget.id)
      toast('success', 'Aplicação excluída')
      setDeleteTarget(null); await load()
    } catch { toast('error', 'Erro ao excluir') }
    finally { setDeleting(false) }
  }

  const filtered = systems.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Aplicações</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{systems.length} registros</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={openCreate}>
          <i className="ti ti-plus" style={{ fontSize: 16 }}></i> Nova Aplicação
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
              <th>Descrição</th>
              <th>URL</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Nenhuma aplicação encontrada</td></tr>
            ) : filtered.map((s: any) => (
              <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/systems/${s.id}`)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 'var(--radius)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 14 }}>
                      <i className="ti ti-server"></i>
                    </div>
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description || '-'}</td>
                <td>{s.baseUrl ? <code style={{ color: 'var(--accent)' }}>{s.baseUrl}</code> : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-icon" onClick={() => openEdit(s)}><i className="ti ti-edit" style={{ fontSize: 16 }}></i></button>
                    <button className="btn btn-icon" onClick={() => setDeleteTarget(s)}><i className="ti ti-trash" style={{ fontSize: 16, color: 'var(--danger)' }}></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Aplicação' : 'Nova Aplicação'}
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
            <label className="label">Descrição</label>
            <textarea className="input" style={{ minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">URL Base</label>
            <input className="input" type="url" placeholder="https://" value={form.baseUrl} onChange={e => setForm({ ...form, baseUrl: e.target.value })} />
          </div>
          <div>
            <label className="label">Slug</label>
            <input className="input" value={form.slug || slugify(form.name)} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-gerado" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir Aplicação"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleting} />
    </AppLayout>
  )
}
