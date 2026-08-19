export interface User {
  id: string
  name: string
  email: string
  password: string
  roleId: string | null
  emailVerified: number
  createdAt: number
  updatedAt: number
}

/** Public-safe user representation (no password). */
export interface SafeUser {
  id: string
  name: string
  email: string
  roleId: string | null
  emailVerified: number
  createdAt: number
  updatedAt: number
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  roleId?: string | null
}

export interface UpdateUserInput {
  name?: string
  email?: string
  password?: string
  roleId?: string | null
  emailVerified?: number
}