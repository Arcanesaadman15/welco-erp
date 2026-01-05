import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'

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
            return null
          }

          const userPassword = (user as { password?: string }).password
          if (!userPassword) {
            return null
          }

          const isPasswordValid = await compare(password, userPassword)

          if (!isPasswordValid) {
            return null
          }

          // Extract permissions from role
          const permissions = user.role?.permissions?.map((p) => ({
            module: p.module,
            action: p.action,
          })) || []

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
