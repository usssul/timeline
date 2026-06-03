const BASE = '/api'

async function request(url, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers,
  })

  const data = await res.json()

  if (!res.ok) {
    // 401 时清除登录状态
    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    throw new Error(data.error || '请求失败')
  }

  return data
}

// Auth
export function register(username, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function getMe() {
  return request('/auth/me')
}

// Events
export function fetchEvents() {
  return request('/events')
}

export function createEvent(event) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(event),
  })
}

export function deleteEvent(id) {
  return request(`/events/${id}`, {
    method: 'DELETE',
  })
}

export function importEvents(text) {
  return request('/events/import', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export async function exportEvents() {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE}/events/export`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error('导出失败')
  }

  // 下载为文件
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const filename = `时间线数据_${new Date().toISOString().slice(0, 10)}.txt`
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
