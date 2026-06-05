'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../app-layout'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'

const entityLabels: Record<string, string> = {
  expense: 'Lançamentos',
  system_user: 'Contas Vinculadas',
}

const defaultColors = ['#2F6FED', '#0D9488', '#F59E0B', '#E11D48', '#A855F7', '#64748B', '#6b7280', '#22C55E']

interface FormData { name: string; slug: string; entityType: string; color: string; order: number }
const emptyForm: FormData = { name: '', slug: '', entityType: 'expense', color: '#6b7280', order: 0 }

export default function StatusesPage() {
  const [statuses, setStatuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    try { setStatuses(await api.statuses.list()) }
    catch { toast('error', 'Erro ao carregar status') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(s: any) { setEditing(s); setForm({ name: s.name, slug: s.slug, entityType: s.entityType, color: s.color || '#6b7280', order: s.order }); setModalOpen(true) }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) {
        await api.statuses.update(editing.id, { name: form.name, color: form.color, order: form.order })
        toast('success', 'Status atualizado')
      } else {
        await api.statuses.create({ name: form.name, slug: form.slug, entityType: form.entityType, color: form.color, order: form.order })
        toast('success', 'Status criado')
      }
      setModalOpen(false); await load()
    } catch { toast('error', 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  const grouped = statuses.reduce((acc: Record<string, any[]>, s: any) => {
    const key = s.entityType || 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <AppLayout>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Fluxos / Status</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{statuses.length} status cadastrados</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={openCreate}>
          <i className="ti ti-plus" style={{ fontSize: 16 }}></i> Novo Status
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: 32 }}>Carregando...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <i className="ti ti-git-branch" style={{ fontSize: 32, color: 'var(--text-muted)', marginBottom: 12 }}></i>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhum fluxo cadastrado</p>
        </div>
      ) : Object.entries(grouped).map(([entityType, items]) => (
        <div key={entityType} style={{ marginBottom: 24 }}>
          <div className="section-label">{entityLabels[entityType] || entityType}</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cor</th>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th>Ordem</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {(items as any[]).map((s: any) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ width: 24, height: 24, borderRadius: 'var(--radius)', background: s.color || '#6b7280', border: '1px solid var(--border)' }}></div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td><code>{s.slug}</code></td>
                    <td>{s.order}</td>
                    <td>
                      <button className="btn btn-icon" onClick={() => openEdit(s)}><i className="ti ti-edit" style={{ fontSize: 16 }}></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Status' : 'Novo Status'}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Slug</label>
              <input className="input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} disabled={!!editing} required placeholder="ex: pending" />
            </div>
            <div>
              <label className="label">Entidade</label>
              <select className="input" value={form.entityType} onChange={e => setForm({ ...form, entityType: e.target.value })} disabled={!!editing}>
                <option value="expense">Lançamentos</option>
                <option value="system_user">Contas Vinculadas</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">Ordem</label>
              <input className="input" type="number" min="0" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">Cor</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {defaultColors.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: 22, height: 22, borderRadius: 'var(--radius-full)', background: c,
                      border: form.color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                      cursor: 'pointer', outline: 'none',
                    }}></button>
                ))}
              </div>
              <input className="input" style={{ marginTop: 8, height: 30, padding: '0 8px' }} type="text" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="#hex" />
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
