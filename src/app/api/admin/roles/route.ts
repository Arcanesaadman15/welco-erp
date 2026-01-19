import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/api-auth'

export async function GET() {
  try {
    const permission = await requirePermission({ module: 'admin', action: 'read' })
    if (!permission.authorized) {
      return permission.response
    }

    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: roles })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

