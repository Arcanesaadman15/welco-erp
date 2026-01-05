import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      roleId: string
      permissions: { module: string; action: string }[]
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role?: string
    roleId?: string
    permissions?: { module: string; action: string }[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string
    role?: string
    roleId?: string
    permissions?: { module: string; action: string }[]
  }
}
