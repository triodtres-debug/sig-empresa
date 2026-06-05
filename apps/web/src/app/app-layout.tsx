'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ToastContainer } from '@/components/ui/toast'
import { api } from '@/lib/api'

const navGroups = [
  {
    label: 'Geral',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'ti ti-layout-dashboard', resource: 'DASHBOARD' },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { href: '/employees', label: 'Colaboradores', icon: 'ti ti-id-badge', resource: 'EMPLOYEES' },
      { href: '/systems', label: 'Aplicações', icon: 'ti ti-server', resource: 'SYSTEMS' },
      { href: '/users', label: 'Contas Vinculadas', icon: 'ti ti-users', resource: 'USERS' },
      { href: '/expenses', label: 'Lançamentos', icon: 'ti ti-receipt', resource: 'EXPENSES' },
    ],
  },
  {
    label: 'Configurações',
    items: [
      { href: '/statuses', label: 'Fluxos', icon: 'ti ti-git-branch', resource: 'STATUSES' },
      { href: '/groups', label: 'Grupos', icon: 'ti ti-users-group', resource: 'GROUPS' },
      { href: '/authorizations', label: 'Autorizações', icon: 'ti ti-shield-lock', resource: 'AUTHORIZATIONS' },
      { href: '/audit', label: 'Auditoria', icon: 'ti ti-history', resource: 'AUTHORIZATIONS' },
    ],
  },
]

const COLLAPSED_W = 52
const EXPANDED_W = 220

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [employee, setEmployee] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dark, setDark] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/'); return }
    const emp = localStorage.getItem('employee')
    if (emp) {
      const parsed = JSON.parse(emp)
      setEmployee(parsed)
      setIsAdmin(parsed.isAdmin)
    }
    api.auth.me().then(emp => {
      setEmployee(emp)
      setIsAdmin(emp.isAdmin)
      localStorage.setItem('employee', JSON.stringify(emp))
    }).catch(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('employee')
      router.push('/')
    })
    const stored = localStorage.getItem('darkMode')
    if (stored === 'true') {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
    api.auth.permissions().then(res => {
      if (res.all) {
        setIsAdmin(true)
        setPermissions({})
      } else {
        const map: Record<string, boolean> = {}
        for (const p of res.permissions) {
          if (p.action === 'MENU') map[p.resource] = true
        }
        setPermissions(map)
      }
    }).catch(() => {})
  }, [router])

  function toggleDark() {
    const next = !dark
    setDark(next)
    localStorage.setItem('darkMode', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('employee')
    router.push('/')
  }

  if (!employee) return null

  const w = sidebarOpen ? EXPANDED_W : COLLAPSED_W
  const onlyIcon = !sidebarOpen

  function canAccess(resource?: string) {
    if (!resource) return true
    return isAdmin || permissions[resource]
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {sidebarOpen && mobile && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 'calc(var(--z-sidebar) - 1)', animation: 'fadeIn 150ms',
        }} onClick={() => setSidebarOpen(false)} />
      )}

      <aside style={{
        width: w,
        overflow: 'hidden',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 200ms',
        flexShrink: 0,
        position: 'fixed',
        height: '100vh',
        zIndex: 'var(--z-sidebar)',
      }}>
        <div style={{
          padding: onlyIcon ? '14px 0' : '16px 20px',
          borderBottom: '1px solid var(--border)',
          textAlign: onlyIcon ? 'center' : 'left',
          display: 'flex', alignItems: 'center', justifyContent: onlyIcon ? 'center' : 'space-between',
        }}>
          <Link href="/dashboard" style={{
            fontFamily: 'var(--font-display)', fontSize: onlyIcon ? 16 : 20,
            fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-primary)',
            textDecoration: 'none',
          }}>
            {onlyIcon ? 'S·E' : <>SIG<span style={{ color: 'var(--accent)' }}>·</span><span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>E</span></>}
          </Link>
          {!onlyIcon && (
            <button className="btn btn-icon" onClick={() => setSidebarOpen(false)} title="Recolher menu">
              <i className="ti ti-chevron-left" style={{ fontSize: 16 }}></i>
            </button>
          )}
        </div>

        {onlyIcon && (
          <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button className="btn btn-icon" onClick={() => setSidebarOpen(true)} title="Expandir menu">
              <i className="ti ti-chevron-right" style={{ fontSize: 18 }}></i>
            </button>
          </div>
        )}

        {!onlyIcon && (
          <>
            <nav style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {navGroups.map((group, gi) => {
                const visibleItems = group.items.filter(item => canAccess(item.resource))
                if (visibleItems.length === 0) return null
                return (
                  <div key={gi} style={{ marginBottom: gi < navGroups.length - 1 ? 16 : 0 }}>
                    <div style={{ padding: '8px 12px 4px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {group.label}
                    </div>
                    {visibleItems.map(item => {
                      const active = pathname.startsWith(item.href)
                      return (
                        <Link key={item.href} href={item.href}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                            borderRadius: 'var(--radius-md)', fontSize: 13, color: active ? 'var(--accent)' : 'var(--text-secondary)',
                            background: active ? 'var(--accent-light)' : 'transparent', textDecoration: 'none',
                            fontWeight: active ? 500 : 400,
                          }}>
                          <i className={item.icon} style={{ fontSize: 18 }}></i>
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                )
              })}
            </nav>

            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {employee.photo ? (
                  <img src={employee.photo} alt="" className="avatar avatar-sm" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="avatar avatar-sm" style={{ background: employee.isAdmin ? '#A855F7' : 'var(--border)', color: '#FFF' }}>
                    {employee.name.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {employee.name}
                  </div>
                  {employee.isAdmin && <span className="badge badge-admin">Admin</span>}
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
        marginLeft: w,
        transition: 'margin-left 200ms',
      }}>
        <header style={{
          height: 'var(--topbar-h)', background: 'var(--surface)',
          borderBottom: '1px solid var(--border)', display: 'flex',
          alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-icon" onClick={toggleDark} title={dark ? 'Modo claro' : 'Modo escuro'}>
              <i className={dark ? 'ti ti-sun' : 'ti ti-moon'} style={{ fontSize: 20 }}></i>
            </button>
            <button className="btn btn-icon"><i className="ti ti-bell" style={{ fontSize: 20 }}></i></button>
            <button className="btn btn-sm btn-ghost" onClick={handleLogout}>
              <i className="ti ti-logout" style={{ fontSize: 14 }}></i>
              Sair
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px 32px', overflow: 'auto' }}>
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}
