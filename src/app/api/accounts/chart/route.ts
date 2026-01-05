import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const accounts = await prisma.chartOfAccounts.findMany({
      include: {
        parent: true,
        children: true,
      },
      orderBy: { code: 'asc' },
    })

    return NextResponse.json({ success: true, data: accounts })
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, accountType, parentId, description } = body

    const existing = await prisma.chartOfAccounts.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Account code already exists' },
        { status: 400 }
      )
    }

    const account = await prisma.chartOfAccounts.create({
      data: {
        code,
        name,
        accountType,
        parentId: parentId && parentId !== 'none' ? parentId : null,
        description,
      },
    })

    return NextResponse.json({ success: true, data: account }, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

