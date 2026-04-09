const KEY = 'ml_panel_jwt'

export function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(KEY)
}

export function setToken(token: string) {
  localStorage.setItem(KEY, token)
}

export function clearToken() {
  localStorage.removeItem(KEY)
}
