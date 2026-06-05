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

export default function AuthorizationsPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [employeePerms, setEmployeePerms] = useState<Record<string, Record<string, boolean>>>({})
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [allGroups, setAllGroups] = useState<any[]>([])

  async function load() {
    try {
      const [emps, groups] = await Promise.all([api.authorizations.listEmployees(), api.groups.list()])
      setEmployees(emps)
      setAllGroups(groups)
    } catch { toast('error', 'Erro ao carregar dados') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function selectEmployee(emp: any) {
    try {
      const detail = await api.authorizations.getEmployee(emp.id)
      setSelected(detail)
      setSelectedGroups(detail.groups?.map((g: any) => g.group.id) || [])
      const map: Record<string, Record<string, boolean>> = {}
      if (detail.permissions) {
        for (const p of detail.permissions) {
          if (!map[p.resource]) map[p.resource] = {}
          map[p.resource][p.action] = p.allowed
        }
      }
      setEmployeePerms(map)
    } catch { toast('error', 'Erro ao carregar dados do colaborador') }
  }

  async function toggleGroup(groupId: string) {
    if (!selected) return
    const has = selectedGroups.includes(groupId)
    try {
      if (has) {
        await api.groups.removeEmployee(groupId, selected.id)
      } else {
        await api.groups.addEmployee(groupId, selected.id)
      }
      const [emps, detail] = await Promise.all([
        api.authorizations.listEmployees(),
        api.authorizations.getEmployee(selected.id),
      ])
      setEmployees(emps)
      setSelected(detail)
      setSelectedGroups(detail.groups?.map((g: any) => g.group.id) || [])
    } catch (e) { console.error(e); toast('error', 'Erro ao alterar grupo') }
  }

  async function togglePermission(resource: string, action: string, allowed: boolean) {
    if (!selected) return
    setEmployeePerms(prev => ({ ...prev, [resource]: { ...prev[resource], [action]: allowed } }))
    try { await api.authorizations.setPermission(selected.id, { resource, action, allowed }) }
    catch { toast('error', 'Erro ao salvar permissão individual') }
  }

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <h1>Autorizações</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Gerencie permissões por colaborador</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: 32 }}>Carregando...</p>
      ) : (
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ width: 320, flexShrink: 0 }}>
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Colaboradores
              </div>
              {employees.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  Nenhum colaborador encontrado
                </div>
              ) : (
                employees.map(emp => (
                  <button key={emp.id} onClick={() => selectEmployee(emp)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px',
                      background: selected?.id === emp.id ? 'var(--accent-light)' : 'transparent',
                      border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                      textAlign: 'left', fontSize: 13, color: 'var(--text-primary)',
                    }}>
                    {emp.photo ? (
                      <img src={emp.photo} alt="" style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', objectFit: 'cover', background: 'var(--surface)' }} />
                    ) : (
                      <div className="avatar avatar-xs" style={{ background: emp.isAdmin ? '#A855F7' : 'var(--border)', color: '#FFF', width: 28, height: 28, fontSize: 11 }}>
                        {emp.name.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.isAdmin ? 'Admin' : `${emp.groups?.length || 0} grupos`}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {!selected ? (
              <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                <i className="ti ti-arrow-left" style={{ fontSize: 32, color: 'var(--text-muted)', marginBottom: 12 }}></i>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Selecione um colaborador ao lado</p>
              </div>
            ) : selected.isAdmin ? (
              <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                <i className="ti ti-shield-check" style={{ fontSize: 32, color: '#A855F7', marginBottom: 12 }}></i>
                <p style={{ fontSize: 13 }}>Administrador — acesso total ao sistema</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="card">
                  <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600 }}>Grupos</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {allGroups.map(g => (
                      <button key={g.id} onClick={() => toggleGroup(g.id)}
                        className={`btn btn-sm ${selectedGroups.includes(g.id) ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ fontSize: 12 }}>
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ overflowX: 'auto' }}>
                  <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600 }}>Permissões Individuais</div>
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
                            const checked = employeePerms[r]?.[a] ?? false
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
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
