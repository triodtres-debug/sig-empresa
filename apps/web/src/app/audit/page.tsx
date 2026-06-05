'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import AppLayout from '../app-layout'
import { api } from '@/lib/api'

const operationLabels: Record<string, string> = {
  CREATE: 'Criação',
  UPDATE: 'Alteração',
  DELETE: 'Exclusão',
  LOGIN: 'Login',
}

const operationClasses: Record<string, string> = {
  CREATE: 'operation-badge-create',
  UPDATE: 'operation-badge-update',
  DELETE: 'operation-badge-delete',
  LOGIN: 'operation-badge-login',
}

const entityLabels: Record<string, string> = {
  employee: 'Colaborador',
  system: 'Aplicação',
  user: 'Conta Vinculada',
  expense: 'Lançamento',
  status: 'Fluxo',
  group: 'Grupo',
  auth: 'Autenticação',
}

export default function AuditPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [entityType, setEntityType] = useState('')
  const [operation, setOperation] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const limit = 50

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit }
      if (entityType) params.entityType = entityType
      if (operation) params.operation = operation
      const res = await api.audit.list(params)
      setItems(res.items)
      setTotal(res.total)
    } catch { /* empty */ }
    finally { setLoading(false) }
  }, [page, entityType, operation])

  useEffect(() => { load() }, [load])

  function toggleExpand(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <h1>Auditoria</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Histórico de alterações no sistema
        </p>
      </div>

      <div className="filter-bar card" style={{ padding: 12 }}>
        <select value={entityType} onChange={e => { setEntityType(e.target.value); setPage(1) }}>
          <option value="">Todas as entidades</option>
          {Object.entries(entityLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={operation} onChange={e => { setOperation(e.target.value); setPage(1) }}>
          <option value="">Todas as operações</option>
          {Object.entries(operationLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className="count">
          {total} registro{total !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Carregando...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Nenhum registro encontrado</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 160 }}>Data/Hora</th>
                <th>Usuário</th>
                <th style={{ width: 100 }}>Operação</th>
                <th style={{ width: 140 }}>Entidade</th>
                <th style={{ width: 100 }}>ID</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <Fragment key={item.id}>
                  <tr className="table-expandable" style={{ cursor: 'pointer' }} onClick={() => toggleExpand(item.id)}>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {new Date(item.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 500 }}>{item.employeeName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.employeeEmail}</div>
                    </td>
                    <td>
                      <span className={`operation-badge ${operationClasses[item.operation] || ''}`}>
                        {operationLabels[item.operation] || item.operation}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{entityLabels[item.entityType] || item.entityType}</td>
                    <td style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{item.entityId?.slice(0, 8) || '-'}</td>
                    <td>
                      <i className={`ti ti-chevron-${expanded[item.id] ? 'up' : 'down'}`}
                        style={{ fontSize: 14, color: 'var(--text-muted)' }}></i>
                    </td>
                  </tr>
                  {expanded[item.id] && (
                    <tr key={`${item.id}-detail`} className="row-detail">
                      <td colSpan={6}>
                        <div className="row-detail-inner">
                          {item.ip && (
                            <div className="field">
                              <span className="field-label">IP:</span>
                              <span className="field-value">{item.ip}</span>
                            </div>
                          )}
                          {item.userAgent && (
                            <div className="field">
                              <span className="field-label">User-Agent:</span>
                              <span className="field-value">{item.userAgent}</span>
                            </div>
                          )}
                          {item.before && (
                            <div>
                              <div className="code-block-title">Antes</div>
                              <pre className="code-block">{JSON.stringify(item.before, null, 2)}</pre>
                            </div>
                          )}
                          {item.after && (
                            <div>
                              <div className="code-block-title">Depois</div>
                              <pre className="code-block">{JSON.stringify(item.after, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-sm btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <i className="ti ti-chevron-left"></i>
          </button>
          <span className="pagination-info">
            Página {page} de {totalPages}
          </span>
          <button className="btn btn-sm btn-ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <i className="ti ti-chevron-right"></i>
          </button>
        </div>
      )}
    </AppLayout>
  )
}
