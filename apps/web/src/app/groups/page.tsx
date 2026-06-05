'use client'

import { useState, useEffect } from 'react'
import AppLayout from '../app-layout'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { toast } from '@/components/ui/toast'

const resourceLabels: Record<string, string> = {
  DASHBOARD: 'Dashboard',
  EMPLOYEES: 'Colaboradores',
  SYSTEMS: 'Aplicações',
  USERS: 'Contas Vinculadas',
  EXPENSES: 'Lançamentos',
  STATUSES: 'Fluxos',
  GROUPS: 'Grupos',
  AUTHORIZATIONS: 'Autorizações',
}

const actionLabels: Record<string, string> = {
  VIEW: 'Visualizar',
  CREATE: 'Criar',
  EDIT: 'Editar',
  DELETE: 'Excluir',
  MENU: 'Menu',
}

const allResources = ['DASHBOARD', 'EMPLOYEES', 'SYSTEMS', 'USERS', 'EXPENSES', 'STATUSES', 'GROUPS', 'AUTHORIZATIONS']
const allActions = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'MENU']

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [permGroup, setPermGroup] = useState<any>(null)
  const [perms, setPerms] = useState<Record<string, Record<string, boolean>>>({})

  async function load() {
    try { setGroups(await api.groups.list()) }
    catch { toast('error', 'Erro ao carregar grupos') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setForm({ name: '', description: '' }); setModalOpen(true) }
  function openEdit(g: any) { setEditing(g); setForm({ name: g.name, description: g.description || '' }); setModalOpen(true) }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) {
        await api.groups.update(editing.id, form)
        toast('success', 'Grupo atualizado')
      } else {
        await api.groups.create(form)
        toast('success', 'Grupo criado')
      }
      setModalOpen(false); await load()
    } catch { toast('error', 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  function openPermissions(g: any) {
    setPermGroup(g)
    const map: Record<string, Record<string, boolean>> = {}
    if (g.permissions) {
      for (const p of g.permissions) {
        if (!map[p.resource]) map[p.resource] = {}
        map[p.resource][p.action] = p.allowed
      }
    }
    setPerms(map)
  }

  async function togglePermission(resource: string, action: string, allowed: boolean) {
    if (!permGroup) return
    setPerms(prev => ({ ...prev, [resource]: { ...prev[resource], [action]: allowed } }))
    try { await api.groups.setPermission(permGroup.id, { resource, action, allowed }) }
    catch { toast('error', 'Erro ao salvar permissão') }
  }

  async function handleDelete(id: string) {
    try { await api.groups.delete(id); toast('success', 'Grupo excluído'); await load() }
    catch { toast('error', 'Erro ao excluir') }
  }

  return (
    <AppLayout>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Grupos</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{groups.length} grupos cadastrados</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={openCreate}>
          <i className="ti ti-plus" style={{ fontSize: 16 }}></i> Novo Grupo
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: 32 }}>Carregando...</p>
      ) : groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <i className="ti ti-users-group" style={{ fontSize: 32, color: 'var(--text-muted)', marginBottom: 12 }}></i>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhum grupo cadastrado</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Colaboradores</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 500 }}>{g.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{g.description || '-'}</td>
                  <td>{g._count?.employees || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-icon" onClick={() => openPermissions(g)} title="Permissões"><i className="ti ti-shield" style={{ fontSize: 16 }}></i></button>
                      <button className="btn btn-icon" onClick={() => openEdit(g)} title="Editar"><i className="ti ti-edit" style={{ fontSize: 16 }}></i></button>
                      <button className="btn btn-icon" onClick={() => handleDelete(g.id)} title="Excluir"><i className="ti ti-trash" style={{ fontSize: 16 }}></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Grupo' : 'Novo Grupo'}
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
            <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal open={!!permGroup} onClose={() => setPermGroup(null)} title={`Permissões: ${permGroup?.name || ''}`}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <button className="btn btn-md btn-secondary" onClick={() => setPermGroup(null)}>Fechar</button>
          </div>
        }>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 400 }}>
            <thead>
              <tr>
                <th>Recurso</th>
                {allActions.map(a => <th key={a} style={{ textAlign: 'center', fontSize: 11 }}>{actionLabels[a]}</th>)}
              </tr>
            </thead>
            <tbody>
              {allResources.map(r => (
                <tr key={r}>
                  <td style={{ fontWeight: 500 }}>{resourceLabels[r]}</td>
                  {allActions.map(a => {
                    const checked = perms[r]?.[a] ?? false
                    return (
                      <td key={a} style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={checked}
                          onChange={e => togglePermission(r, a, e.target.checked)}
                          style={{ cursor: 'pointer' }} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </AppLayout>
  )
}
