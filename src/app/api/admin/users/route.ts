import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

// Helper to check admin permission
async function checkAdminPermission() {
  const session = await auth()
  if (!session?.user?.email) return false

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: { permissions: true },
      },
    },
  })

  return user?.role?.permissions?.some(
    (p) => p.module === 'admin' && p.action === 'read'
  )
}

export async function GET() {
  try {
    if (!(await checkAdminPermission())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true,
        role: {
          select: { id: true, name: true },
        },
        department: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkAdminPermission())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, fullName, phone, roleId, departmentId, status } = body

    // Validate required fields
    if (!email || !password || !fullName || !roleId) {
      return NextResponse.json(
        { success: false, error: 'Email, password, full name, and role are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone: phone || null,
        roleId,
        departmentId: departmentId || null,
        status: status || 'active',
      },
      include: {
        role: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

