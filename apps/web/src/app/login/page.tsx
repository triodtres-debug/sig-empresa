'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api.auth.login(email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('employee', JSON.stringify(data.employee))
      router.push('/dashboard')
    } catch {
      setError('Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 24 }}>
      <div style={{ width: 400, maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            SIG<span style={{ color: 'var(--accent)', fontSize: 36 }}>·</span><span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Empresa</span>
          </div>
          <div style={{ height: 3, width: 36, background: 'var(--accent)', borderRadius: 2, margin: '6px auto 0' }}></div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Sistema de Gestão Empresarial</p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Entrar no SIG</h2>

          {error && (
            <div style={{ padding: '8px 12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: 12, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="label">Senha</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 16, fontFamily: 'var(--font-mono)' }}>
          SIG · v1.0
        </p>
      </div>
    </div>
  )
}
