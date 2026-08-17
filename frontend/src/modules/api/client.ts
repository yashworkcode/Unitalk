// src/modules/api/client.ts
// WHAT: The ONE place in the frontend that knows how to talk REST to the
// backend - every component calls a function from here instead of calling
// fetch() directly. WHY: if the API base URL, auth header, or error
// shape ever changes, we fix it in one file instead of hunting through
// every component that happens to call fetch().

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'unitalk.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong. Please try again.', response.status)
  }
  return data as T
}

// ---- Types returned by the backend (see backend/models & routes) ----
export type ApiUser = {
  id: string
  userId: string
  name: string
  username: string
  handle: string
  email: string
  avatar: string
  country: string
  bio: string
  chatLanguage: string
  settings: {
    showOriginalMessage: boolean
    autoTranslate: boolean
    voiceTranslation: boolean
    subtitleTranslation: boolean
    appLanguage: string
  }
  isOnline: boolean
  lastSeen: string
}

export type ApiChat = {
  id: string
  name: string
  handle: string
  avatar?: string
  online?: boolean
  language: string
  native?: string
  preview: string
  time: string
  unread?: number
  otherUserId: string
}

export type ApiAttachment = { kind: 'image' | 'video' | 'audio'; name: string; url: string }

export type ApiMessage = {
  id: string
  from: 'me' | 'them'
  text: string
  original?: string
  translated?: boolean
  time: string
  attachment?: ApiAttachment
}

// ---- Auth ----
export const authApi = {
  register: (payload: { name: string; username: string; email: string; password: string; chatLanguage?: string }) =>
    request<{ token: string; user: ApiUser }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: ApiUser }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    request<{ token: string; user: ApiUser }>(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
  me: () => request<{ user: ApiUser }>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
}

// ---- Users ----
export const usersApi = {
  search: (q: string) => request<{ users: ApiUser[] }>(`/users/search?q=${encodeURIComponent(q)}`),
  online: () => request<{ users: ApiUser[] }>('/users/online'),
  updateProfile: (payload: Partial<Pick<ApiUser, 'name' | 'bio' | 'country' | 'avatar' | 'chatLanguage'>>) =>
    request<{ user: ApiUser }>('/users/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  updateSettings: (payload: Partial<ApiUser['settings']>) =>
    request<{ user: ApiUser }>('/users/me/settings', { method: 'PATCH', body: JSON.stringify(payload) }),
}

// ---- Chats ----
export const chatsApi = {
  list: () => request<{ chats: ApiChat[] }>('/chats'),
  create: (payload: { username: string; language: string }) =>
    request<{ chat: ApiChat }>('/chats', { method: 'POST', body: JSON.stringify(payload) }),
  changeLanguage: (chatId: string, language: string) =>
    request<{ chat: ApiChat }>(`/chats/${chatId}/language`, { method: 'PATCH', body: JSON.stringify({ language }) }),
  remove: (chatId: string) => request<{ message: string }>(`/chats/${chatId}`, { method: 'DELETE' }),
}

// ---- Messages ----
export const messagesApi = {
  history: (chatId: string) => request<{ messages: ApiMessage[] }>(`/messages/${chatId}`),
}

export { ApiError }
