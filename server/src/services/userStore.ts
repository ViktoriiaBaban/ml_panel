import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { User, UserRole, UserStatus } from '@/types/domain'
import { users as seedUsersFixture } from './fixtures/adminMonitoring'

export type ProfileConnection = {
  serviceId: string
  serviceName: string
  connected: boolean
  username?: string
  token?: string
  updatedAt: string
}

export type StoredUser = {
  id: number
  email: string
  name: string
  role: UserRole
  status: UserStatus
  registrationDate: string
  lastLogin: string
  /** Подпись должности в UI (не путать с role user | admin). */
  jobTitle: string
  password: string
  connections: ProfileConnection[]
}

export type SessionMe = {
  id: number
  name: string
  email: string
  jobTitle: string
  role: UserRole
}

type InvitationRecord = {
  code: string
  role: UserRole
  expiresAt: string
  createdAt: string
}

type UsersFile = {
  sessionUserId: number
  invitationLinks: InvitationRecord[]
  users: StoredUser[]
}

const USERS_PATH = resolve(process.cwd(), 'data', 'users.json')
const PROFILE_LEGACY_PATH = resolve(process.cwd(), 'data', 'profile-settings.json')

const DEFAULT_PASSWORD = 'changeme123'

function defaultConnections(): ProfileConnection[] {
  return [
    { serviceId: 'gitlab', serviceName: 'GitLab', connected: false, updatedAt: '—' },
    { serviceId: 'grafana', serviceName: 'Grafana', connected: false, updatedAt: '—' },
    { serviceId: 'nifi', serviceName: 'Apache NiFi', connected: false, updatedAt: '—' },
    { serviceId: 'minio', serviceName: 'Minio', connected: false, updatedAt: '—' },
    { serviceId: 'clickhouse', serviceName: 'ClickHouse', connected: false, updatedAt: '—' },
  ]
}

function jobTitleForSeedRole(role: UserRole): string {
  if (role === 'admin') return 'Администратор'
  return 'Специалист'
}

function jobTitleForSeed(u: User): string {
  return jobTitleForSeedRole(u.role)
}

function fixtureToStored(u: User): StoredUser {
  return {
    ...u,
    jobTitle: jobTitleForSeed(u),
    password: DEFAULT_PASSWORD,
    connections: defaultConnections(),
  }
}

const DEFAULT_FILE: UsersFile = {
  sessionUserId: 1,
  invitationLinks: [],
  users: seedUsersFixture.map(fixtureToStored),
}

let initialized = false

async function ensureDir() {
  await mkdir(dirname(USERS_PATH), { recursive: true })
}

function nowRu() {
  return new Date().toLocaleString('ru-RU').replace(',', '')
}

function sanitizeConnections(list: ProfileConnection[]): ProfileConnection[] {
  return list.map((c) => ({ ...c, token: undefined }))
}

/** Публичная модель пользователя для админки и списков (без пароля и токенов). */
export function toPublicUser(u: StoredUser): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    registrationDate: u.registrationDate,
    lastLogin: u.lastLogin,
    jobTitle: u.jobTitle,
  }
}

async function tryMigrateLegacyProfile(data: UsersFile): Promise<UsersFile> {
  const legacyFile = Bun.file(PROFILE_LEGACY_PATH)
  if (!(await legacyFile.exists())) return data

  try {
    const raw = await legacyFile.text()
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed.deleted === true) {
      await Bun.write(PROFILE_LEGACY_PATH, JSON.stringify({ migrated: true }, null, 2))
      return data
    }

    const prof = parsed.profile as { id?: number; name?: string; email?: string; role?: string } | undefined
    const acc = parsed.account as { password?: string } | undefined
    const conns = parsed.connections as ProfileConnection[] | undefined

    const targetId = data.sessionUserId
    const idx = data.users.findIndex((x) => x.id === targetId)
    if (idx < 0 || !prof) {
      await Bun.write(PROFILE_LEGACY_PATH, JSON.stringify({ migrated: true }, null, 2))
      return data
    }

    if (typeof prof.name === 'string') data.users[idx].name = prof.name
    if (typeof prof.email === 'string') data.users[idx].email = prof.email
    if (typeof prof.role === 'string') data.users[idx].jobTitle = prof.role
    if (acc?.password) data.users[idx].password = String(acc.password)
    if (Array.isArray(conns) && conns.length > 0) {
      data.users[idx].connections = conns.map((c) => ({
        ...c,
        token: undefined,
      }))
    }

    await Bun.write(USERS_PATH, JSON.stringify(data, null, 2))
    await Bun.write(PROFILE_LEGACY_PATH, JSON.stringify({ migrated: true }, null, 2))
  } catch {
    /* ignore */
  }
  return data
}

async function readFile(): Promise<UsersFile> {
  if (!initialized) {
    await ensureDir()
    const file = Bun.file(USERS_PATH)
    if (!(await file.exists())) {
      await Bun.write(USERS_PATH, JSON.stringify(DEFAULT_FILE, null, 2))
    }
    initialized = true
  }

  try {
    const raw = await Bun.file(USERS_PATH).text()
    const parsed = JSON.parse(raw) as UsersFile
    if (!Array.isArray(parsed.users)) throw new Error('invalid')
    let data: UsersFile = {
      sessionUserId: typeof parsed.sessionUserId === 'number' ? parsed.sessionUserId : 1,
      invitationLinks: Array.isArray(parsed.invitationLinks) ? parsed.invitationLinks : [],
      users: parsed.users.map((u) => {
        const base = u as StoredUser
        return {
          id: base.id,
          email: base.email,
          name: base.name,
          role: base.role,
          status: base.status,
          registrationDate: base.registrationDate,
          lastLogin: base.lastLogin,
          connections: Array.isArray(base.connections) ? base.connections : defaultConnections(),
          jobTitle: typeof base.jobTitle === 'string' ? base.jobTitle : jobTitleForSeedRole(base.role),
          password: typeof base.password === 'string' ? base.password : DEFAULT_PASSWORD,
        }
      }),
    }
    data = await tryMigrateLegacyProfile(data)
    return data
  } catch {
    await Bun.write(USERS_PATH, JSON.stringify(DEFAULT_FILE, null, 2))
    return DEFAULT_FILE
  }
}

async function writeFile(data: UsersFile) {
  await ensureDir()
  await Bun.write(USERS_PATH, JSON.stringify(data, null, 2))
}

function getUserById(data: UsersFile, userId: number): StoredUser | null {
  return data.users.find((x) => x.id === userId) ?? null
}

export const userStore = {
  async findStoredById(id: number): Promise<StoredUser | null> {
    const data = await readFile()
    return getUserById(data, id)
  },

  async authenticate(email: string, password: string): Promise<StoredUser | null> {
    const data = await readFile()
    const u = data.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
    if (!u || u.status !== 'active' || u.password !== password) return null
    return u
  },

  async listPublicUsers(): Promise<User[]> {
    const data = await readFile()
    return data.users.map(toPublicUser)
  },

  async getMeById(userId: number): Promise<SessionMe | null> {
    const data = await readFile()
    const u = getUserById(data, userId)
    if (!u) return null
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      jobTitle: u.jobTitle,
      role: u.role,
    }
  },

  /** Профиль: поле profile.role в ответе = должность (jobTitle). */
  async getProfileByUserId(userId: number) {
    const data = await readFile()
    const u = getUserById(data, userId)
    if (!u) return null
    return {
      profile: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.jobTitle,
      },
      connections: sanitizeConnections(u.connections),
    }
  },

  async updateProfileByUserId(userId: number, input: { name?: string; email?: string }) {
    const data = await readFile()
    const u = getUserById(data, userId)
    if (!u) return null
    const idx = data.users.findIndex((x) => x.id === u.id)
    if (idx < 0) return null
    if (typeof input.name === 'string') data.users[idx].name = input.name.trim()
    if (typeof input.email === 'string') data.users[idx].email = input.email.trim()
    await writeFile(data)
    return (await this.getProfileByUserId(userId))!
  },

  async changePasswordByUserId(userId: number, input: { currentPassword: string; newPassword: string }) {
    const data = await readFile()
    const u = getUserById(data, userId)
    if (!u) return { error: 'not_found' as const }
    const idx = data.users.findIndex((x) => x.id === u.id)
    if (idx < 0) return { error: 'not_found' as const }

    const current = input.currentPassword ?? ''
    const next = input.newPassword ?? ''
    if (next.length < 8) return { error: 'weak_password' as const }

    const stored = data.users[idx].password ?? ''
    if (stored && stored !== current) return { error: 'wrong_password' as const }
    if (!stored && current.length > 0) return { error: 'wrong_password' as const }

    data.users[idx].password = next
    await writeFile(data)
    return { ok: true as const }
  },

  async deleteAccountByUserId(userId: number, password: string) {
    const data = await readFile()
    const u = getUserById(data, userId)
    if (!u) return { error: 'not_found' as const }
    const idx = data.users.findIndex((x) => x.id === u.id)
    if (idx < 0) return { error: 'not_found' as const }
    if (!password || data.users[idx].password !== password) return { error: 'wrong_password' as const }

    data.users.splice(idx, 1)
    if (data.sessionUserId === userId) {
      data.sessionUserId = data.users[0]?.id ?? 0
    }
    await writeFile(data)
    return { ok: true as const }
  },

  async upsertConnectionByUserId(userId: number, input: { serviceId: string; username: string; token: string }) {
    const data = await readFile()
    const u = getUserById(data, userId)
    if (!u) return null
    const idx = data.users.findIndex((x) => x.id === u.id)
    if (idx < 0) return null
    const cIdx = data.users[idx].connections.findIndex((c) => c.serviceId === input.serviceId)
    if (cIdx < 0) return null
    data.users[idx].connections[cIdx] = {
      ...data.users[idx].connections[cIdx],
      connected: true,
      username: input.username.trim(),
      token: input.token.trim(),
      updatedAt: nowRu(),
    }
    await writeFile(data)
    return (await this.getProfileByUserId(userId))!
  },

  async addUser(input: { email: string; name?: string; role?: UserRole; password: string }) {
    const data = await readFile()
    const email = input.email.trim()
    if (!email) return null
    if (!input.password || input.password.length < 8) return null
    if (data.users.some((x) => x.email.toLowerCase() === email.toLowerCase())) return null

    const nextId = Math.max(0, ...data.users.map((u) => u.id)) + 1
    const name = (input.name ?? '').trim() || email.split('@')[0] || email
    const role: UserRole = input.role ?? 'user'
    const registrationDate = new Date().toISOString().split('T')[0] ?? '—'
    const u: StoredUser = {
      id: nextId,
      email,
      name,
      role,
      jobTitle: role === 'admin' ? 'Администратор' : 'Специалист',
      status: 'active',
      registrationDate,
      lastLogin: '—',
      password: input.password,
      connections: defaultConnections(),
    }
    data.users.push(u)
    await writeFile(data)
    return toPublicUser(u)
  },

  async updateUser(id: number, input: { email?: string; name?: string; role?: UserRole; jobTitle?: string }) {
    const data = await readFile()
    const user = data.users.find((item) => item.id === id)
    if (!user) return null
    const email = input.email?.trim()
    if (email) user.email = email
    if (typeof input.name === 'string') user.name = input.name.trim()
    if (input.role) user.role = input.role
    if (typeof input.jobTitle === 'string') user.jobTitle = input.jobTitle.trim()
    await writeFile(data)
    return toPublicUser(user)
  },

  async toggleUserStatus(id: number) {
    const data = await readFile()
    const u = data.users.find((x) => x.id === id)
    if (!u) return null
    u.status = u.status === 'active' ? 'blocked' : 'active'
    await writeFile(data)
    return toPublicUser(u)
  },

  async deleteUser(id: number) {
    const data = await readFile()
    const idx = data.users.findIndex((u) => u.id === id)
    if (idx < 0) return false
    data.users.splice(idx, 1)
    if (data.sessionUserId === id) {
      data.sessionUserId = data.users[0]?.id ?? 0
    }
    await writeFile(data)
    return true
  },

  async resetUserPassword(id: number, password: string) {
    const data = await readFile()
    const user = data.users.find((item) => item.id === id)
    if (!user) return null
    if (!password || password.length < 8) return null
    user.password = password
    await writeFile(data)
    return { ok: true as const }
  },

  async createInvitationLink(input: { role?: UserRole }) {
    const data = await readFile()
    const role: UserRole = input.role ?? 'user'
    const code = Math.random().toString(36).slice(2, 10)
    const createdAt = new Date().toISOString()
    const expiresAtDate = new Date(Date.now() + 5 * 60 * 60 * 1000)
    const expiresAt = expiresAtDate.toISOString()
    data.invitationLinks.push({ code, role, createdAt, expiresAt })
    await writeFile(data)
    return { code, role, url: `https://ml-panel.local/register?code=${code}`, createdAt, expiresAt }
  },

  async registerByInvitation(input: { code: string; email: string; name?: string; password: string }) {
    const data = await readFile()
    const invite = data.invitationLinks.find((item) => item.code === input.code)
    if (!invite) return { error: 'invalid_code' as const }
    if (new Date(invite.expiresAt).getTime() < Date.now()) return { error: 'expired_code' as const }

    const added = await this.addUser({
      email: input.email,
      name: input.name,
      role: invite.role,
      password: input.password,
    })
    if (!added) return { error: 'invalid_payload' as const }
    const next = await readFile()
    next.invitationLinks = next.invitationLinks.filter((item) => item.code !== input.code)
    await writeFile(next)
    return { user: added }
  },

}
