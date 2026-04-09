import axios, { type AxiosError, type AxiosInstance } from 'axios'

import { clearToken, getToken } from '@/lib/authToken'

export type ApiErrorShape = {
  error: string
  message?: string
  details?: unknown
}

export class ApiError extends Error {
  public readonly status: number
  public readonly payload?: ApiErrorShape

  constructor(message: string, opts: { status: number; payload?: ApiErrorShape }) {
    super(message)
    this.name = 'ApiError'
    this.status = opts.status
    this.payload = opts.payload
  }
}

export type ApiClientOptions = {
  baseUrl: string
  defaultHeaders?: Record<string, string>
}

function isApiErrorShape(v: unknown): v is ApiErrorShape {
  return typeof v === 'object' && v !== null && 'error' in v
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err

  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<unknown>
    const status = ax.response?.status ?? 0
    const data = ax.response?.data
    const payload = isApiErrorShape(data) ? data : undefined
    const message =
      payload?.message ??
      ax.message ??
      (status ? `Request failed (${status})` : 'Network error')
    return new ApiError(message, { status, payload })
  }

  return new ApiError('Unexpected error', { status: 0 })
}

export class ApiClient {
  private readonly http: AxiosInstance

  constructor(opts: ApiClientOptions) {
    this.http = axios.create({
      baseURL: opts.baseUrl,
      headers: opts.defaultHeaders,
    })

    this.http.interceptors.request.use((config) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.http.interceptors.response.use(
      (res) => res,
      (err: unknown) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          const url = err.config?.url ?? ''
          if (!url.includes('/auth/login')) {
            clearToken()
            const path = typeof window !== 'undefined' ? window.location.pathname : ''
            if (!path.startsWith('/login')) {
              window.location.assign(`/login?redirect=${encodeURIComponent(path + (window.location.search ?? ''))}`)
            }
          }
        }
        return Promise.reject(err)
      },
    )
  }

  async get<T>(path: string, opts?: { signal?: AbortSignal }): Promise<T> {
    try {
      const res = await this.http.get<T>(path, { signal: opts?.signal })
      return res.data
    } catch (e) {
      throw toApiError(e)
    }
  }

  async post<TResponse, TBody>(
    path: string,
    body: TBody,
    opts?: { signal?: AbortSignal },
  ): Promise<TResponse> {
    try {
      const res = await this.http.post<TResponse>(path, body, { signal: opts?.signal })
      return res.data
    } catch (e) {
      throw toApiError(e)
    }
  }

  async patch<TResponse, TBody>(
    path: string,
    body: TBody,
    opts?: { signal?: AbortSignal },
  ): Promise<TResponse> {
    try {
      const res = await this.http.patch<TResponse>(path, body, { signal: opts?.signal })
      return res.data
    } catch (e) {
      throw toApiError(e)
    }
  }

  async del<TResponse>(path: string, opts?: { signal?: AbortSignal }): Promise<TResponse> {
    try {
      const res = await this.http.delete<TResponse>(path, { signal: opts?.signal })
      return res.data
    } catch (e) {
      throw toApiError(e)
    }
  }
}

export const api = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5173/api',
})

