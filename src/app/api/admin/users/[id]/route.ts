import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getBcryptCost, validatePasswordStrength } from '@/lib/password-policy'
import { auth } from '@/lib/auth'
import { requirePermission } from '@/lib/api-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permission = await requirePermission({ module: 'admin', action: 'read' })
    if (!permission.authorized) {
      return permission.response
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
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
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permission = await requirePermission({ module: 'admin', action: 'write' })
    if (!permission.authorized) {
      return permission.response
    }

    const { id } = await params
    const body = await request.json()
    const { email, password, fullName, phone, roleId, departmentId, status } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check email uniqueness if changed
    if (email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } })
      if (emailTaken) {
        return NextResponse.json(
          { success: false, error: 'Email is already in use' },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      email,
      fullName,
      phone: phone || null,
      roleId,
      departmentId: departmentId || null,
      status,
    }

    // Only update password if provided
    if (password) {
      const passwordCheck = validatePasswordStrength(password)
      if (!passwordCheck.valid) {
        return NextResponse.json(
          { success: false, error: passwordCheck.message || 'Weak password' },
          { status: 400 }
        )
      }
      updateData.password = await hash(password, getBcryptCost())
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permission = await requirePermission({ module: 'admin', action: 'delete' })
    if (!permission.authorized) {
      return permission.response
    }

    const { id } = await params
    const session = await auth()

    // Prevent self-deletion
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      if (currentUser?.id === id) {
        return NextResponse.json(
          { success: false, error: 'You cannot delete your own account' },
          { status: 400 }
        )
      }
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

