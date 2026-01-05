import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Get default role (User)
    let defaultRole = await prisma.role.findUnique({
      where: { name: 'User' },
    })

    // Create default role if it doesn't exist
    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: {
          name: 'User',
          description: 'Regular user with limited access',
        },
      })
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        roleId: defaultRole.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: 'User created successfully',
      user,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

