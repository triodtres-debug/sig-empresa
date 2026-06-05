'use client'

import { useState, useEffect } from 'react'
import AppLayout from '../app-layout'
import { api } from '@/lib/api'

const activityIcons: Record<string, string> = {
  employee: 'ti ti-user-plus', expense: 'ti ti-receipt', system: 'ti ti-server', user: 'ti ti-users', status: 'ti ti-git-branch',
}

export default function DashboardPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [systems, setSystems] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.employees.list().then(d => { setEmployees(d); return d }),
      api.systems.list().then(d => { setSystems(d); return d }),
      api.users.list().then(d => { setUsers(d); return d }),
      api.expenses.list().then(d => { setExpenses(d); return d }),
    ]).finally(() => setLoading(false))
  }, [])

  const totalExpense = expenses.reduce((s: number, e: any) => s + parseFloat(e.amount), 0)
  const kpis = [
    { label: 'Colaboradores', value: String(employees.length), trend: 'Total cadastrados', icon: 'ti ti-id-badge', color: '#2F6FED' },
    { label: 'Aplicações', value: String(systems.length), trend: 'Total registradas', icon: 'ti ti-server', color: '#A855F7' },
    { label: 'Contas Vinculadas', value: String(users.length), trend: 'Total vinculadas', icon: 'ti ti-users', color: '#0D9488' },
    { label: 'Lançamentos', value: totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), trend: `${expenses.length} registros`, icon: 'ti ti-receipt', color: '#F59E0B' },
  ]

  const recent = [...expenses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)
  const activeExpenses = expenses.filter((e: any) => e.status?.slug !== 'approved' && e.status?.slug !== 'rejected').length

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <h1>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Painel geral do sistema</p>
      </div>

      {loading ? (
        <div className="kpi-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="kpi-card" style={{ height: 80, animation: 'pulse 1.5s infinite' }}></div>
          ))}
        </div>
      ) : (
        <>
          <div className="kpi-grid">
            {kpis.map(kpi => (
              <div key={kpi.label} className="kpi-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="kpi-label">{kpi.label}</span>
                  <i className={kpi.icon} style={{ fontSize: 20, color: kpi.color, opacity: 0.7 }}></i>
                </div>
                <span className="kpi-value">{kpi.value}</span>
                <span className="kpi-trend">{kpi.trend}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card">
              <div className="card-header">
                <span className="section-label" style={{ margin: 0 }}>Lançamentos Recentes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recent.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhum lançamento registrado</span>
                ) : recent.map((ex: any) => (
                  <div key={ex.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <i className="ti ti-receipt" style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 2 }}></i>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{ex.description}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {parseFloat(ex.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · {ex.status?.name || 'Pendente'}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                      {new Date(ex.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="section-label" style={{ margin: 0 }}>Pendências</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Despesas pendentes', value: String(activeExpenses), color: 'var(--warning)' },
                  { label: 'Colaboradores ativos', value: String(employees.filter((e: any) => e.active !== false).length), color: 'var(--success)' },
                  { label: 'Aplicações registradas', value: String(systems.length), color: 'var(--accent)' },
                  { label: 'Contas vinculadas', value: String(users.length), color: 'var(--info)' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: 16, fontWeight: 500, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  )
}
