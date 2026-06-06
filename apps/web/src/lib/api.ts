import { toast } from '../components/ui/toast'

const BASE = '/api'

async function request(path: string, options?: RequestInit) {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('employee')
    window.location.href = '/'
    throw new Error('Unauthorized')
  }

  if (res.status === 403) {
    toast('error', 'Você não tem permissão para esta ação')
    throw new Error('Forbidden')
  }

  if (res.status === 404) {
    toast('warning', 'Registro não encontrado')
    throw new Error('Not Found')
  }

  if (!res.ok) {
    const text = await res.text()
    let message = text || `HTTP ${res.status}`
    try { const parsed = JSON.parse(text); if (parsed.message) message = parsed.message } catch { /* ignore parse error */ }
    throw new Error(message)
  }

  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request('/auth/me'),
    permissions: () => request('/auth/permissions'),
  },
  employees: {
    list: () => request('/employees'),
    get: (id: string) => request(`/employees/${id}`),
    getById: (id: string) => request(`/employees/${id}`),
    create: (data: { name: string; email: string; cpf: string; password: string; isAdmin?: boolean }) =>
      request('/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request(`/employees/${id}`, { method: 'DELETE' }),
    updatePhoto: (id: string, file: File) => {
      const formData = new FormData()
      formData.append('photo', file)
      const token = localStorage.getItem('token')
      return fetch(`/api/employees/${id}/photo`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then(async res => {
        if (res.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('employee'); window.location.href = '/'; throw new Error('Unauthorized') }
        if (!res.ok) { const text = await res.text(); let m = text; try { const p = JSON.parse(text); if (p.message) m = p.message } catch { /* ignore parse error */ }; throw new Error(m) }
        return res.json()
      })
    },
    removePhoto: (id: string) => request(`/employees/${id}/photo`, { method: 'DELETE' }),
  },
  systems: {
    list: () => request('/systems'),
    get: (id: string) => request(`/systems/${id}`),
    getById: (id: string) => request(`/systems/${id}`),
    create: (data: { name: string; slug: string; description?: string; baseUrl?: string }) =>
      request('/systems', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request(`/systems/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request(`/systems/${id}`, { method: 'DELETE' }),
    assignEmployee: (systemId: string, employeeId: string) =>
      request(`/systems/${systemId}/employees/${employeeId}`, { method: 'POST' }),
    removeEmployee: (systemId: string, employeeId: string) =>
      request(`/systems/${systemId}/employees/${employeeId}`, { method: 'DELETE' }),
  },
  users: {
    list: () => request('/users'),
    get: (id: string) => request(`/users/${id}`),
    getById: (id: string) => request(`/users/${id}`),
    create: (data: { name: string; email?: string; phone?: string; document?: string }) =>
      request('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request(`/users/${id}`, { method: 'DELETE' }),
  },
  expenses: {
    list: () => request('/expenses'),
    get: (id: string) => request(`/expenses/${id}`),
    getById: (id: string) => request(`/expenses/${id}`),
    create: (data: { description: string; amount: number; date: string; category?: string; systemId?: string }) =>
      request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request(`/expenses/${id}`, { method: 'DELETE' }),
  },
  statuses: {
    list: (entityType?: string) => request(`/statuses${entityType ? `?entityType=${entityType}` : ''}`),
    create: (data: { name: string; slug: string; entityType: string; color?: string; order?: number }) =>
      request('/statuses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name?: string; color?: string; order?: number }) =>
      request(`/statuses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  groups: {
    list: () => request('/groups'),
    get: (id: string) => request(`/groups/${id}`),
    create: (data: { name: string; description?: string }) =>
      request('/groups', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name?: string; description?: string }) =>
      request(`/groups/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/groups/${id}`, { method: 'DELETE' }),
    setPermission: (groupId: string, data: { resource: string; action: string; allowed: boolean }) =>
      request(`/groups/${groupId}/permissions`, { method: 'POST', body: JSON.stringify(data) }),
    removePermission: (groupId: string, resource: string, action: string) =>
      request(`/groups/${groupId}/permissions/${resource}/${action}`, { method: 'DELETE' }),
    addEmployee: (groupId: string, employeeId: string) =>
      request(`/groups/${groupId}/employees/${employeeId}`, { method: 'POST' }),
    removeEmployee: (groupId: string, employeeId: string) =>
      request(`/groups/${groupId}/employees/${employeeId}`, { method: 'DELETE' }),
  },
  authorizations: {
    listEmployees: () => request('/authorizations/employees'),
    getEmployee: (id: string) => request(`/authorizations/employees/${id}`),
    listResources: () => request('/authorizations/resources'),
    setPermission: (employeeId: string, data: { resource: string; action: string; allowed: boolean }) =>
      request(`/authorizations/employees/${employeeId}/permissions`, { method: 'POST', body: JSON.stringify(data) }),
    removePermission: (employeeId: string, resource: string, action: string) =>
      request(`/authorizations/employees/${employeeId}/permissions/${resource}/${action}`, { method: 'DELETE' }),
  },
  audit: {
    list: (params?: { page?: number; limit?: number; employeeId?: string; entityType?: string; operation?: string; dateFrom?: string; dateTo?: string }) => {
      const q = new URLSearchParams()
      if (params?.page) q.set('page', String(params.page))
      if (params?.limit) q.set('limit', String(params.limit))
      if (params?.employeeId) q.set('employeeId', params.employeeId)
      if (params?.entityType) q.set('entityType', params.entityType)
      if (params?.operation) q.set('operation', params.operation)
      if (params?.dateFrom) q.set('dateFrom', params.dateFrom)
      if (params?.dateTo) q.set('dateTo', params.dateTo)
      const qs = q.toString()
      return request(`/audit${qs ? `?${qs}` : ''}`)
    },
  },
}
