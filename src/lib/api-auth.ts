import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import type { ModuleName, ActionType } from '@/lib/permissions'

interface PermissionCheck {
  module: ModuleName
  action: ActionType
}

/**
 * Check if the current user has the required permission
 * Returns the user if authorized, or null if not
 */
export async function checkPermission(required: PermissionCheck) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  })

  if (!user) return null

  const hasPermission = user.role?.permissions?.some(
    (p) => p.module === required.module && p.action === required.action
  )

  if (!hasPermission) return null

  return user
}

/**
 * Middleware helper for API routes
 * Returns a 403 response if unauthorized
 */
export async function requirePermission(required: PermissionCheck) {
  const user = await checkPermission(required)
  
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized - insufficient permissions' },
        { status: 403 }
      ),
      user: null,
    }
  }

  return {
    authorized: true,
    response: null,
    user,
  }
}

/**
 * Check if user is authenticated (any role)
 */
export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user?.email) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized - please log in' },
        { status: 401 }
      ),
      user: null,
    }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  })

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      ),
      user: null,
    }
  }

  return {
    authorized: true,
    response: null,
    user,
  }
}

