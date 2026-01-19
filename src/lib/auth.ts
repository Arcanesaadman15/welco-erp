import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'

type Attempt = {
  count: number
  firstAttempt: number
  lockedUntil?: number
}

const failedAttempts = new Map<string, Attempt>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_LOCK_MS = 10 * 60 * 1000 // 10 minutes
const isProduction = process.env.NODE_ENV === 'production'

function getAttemptKey(email: string) {
  return email.trim().toLowerCase()
}

function isLocked(email: string) {
  const key = getAttemptKey(email)
  const attempt = failedAttempts.get(key)
  if (!attempt?.lockedUntil) return false
  if (attempt.lockedUntil > Date.now()) return true
  failedAttempts.delete(key)
  return false
}

function recordFailure(email: string) {
  const key = getAttemptKey(email)
  const existing = failedAttempts.get(key)
  const now = Date.now()

  if (!existing || now - existing.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    failedAttempts.set(key, { count: 1, firstAttempt: now })
    return
  }

  const nextCount = existing.count + 1
  const lockedUntil =
    nextCount >= RATE_LIMIT_MAX_ATTEMPTS ? now + RATE_LIMIT_LOCK_MS : existing.lockedUntil

  failedAttempts.set(key, {
    count: nextCount,
    firstAttempt: existing.firstAttempt,
    lockedUntil,
  })
}

function resetFailures(email: string) {
  failedAttempts.delete(getAttemptKey(email))
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        if (isLocked(email)) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: { 
              role: {
                include: {
                  permissions: true,
                },
              },
            },
          })

          if (!user) {
            recordFailure(email)
            return null
          }

          const userPassword = (user as { password?: string }).password
          if (!userPassword) {
            recordFailure(email)
            return null
          }

          const isPasswordValid = await compare(password, userPassword)

          if (!isPasswordValid) {
            recordFailure(email)
            return null
          }

          if (user.status && user.status !== 'active') {
            recordFailure(email)
            return null
          }

          // Extract permissions from role
          const permissions = user.role?.permissions?.map((p) => ({
            module: p.module,
            action: p.action,
          })) || []

          resetFailures(email)

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role?.name || 'User',
            roleId: user.roleId || '',
            permissions: permissions,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.roleId = user.roleId
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.roleId = token.roleId as string
        session.user.permissions = token.permissions as { module: string; action: string }[]
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8, // 8 hours
  },
  trustHost: true,
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
})

// Helper to get current user with permissions from server
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
      department: true,
    },
  })

  return user
}
