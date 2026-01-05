import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: customers })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      name,
      contactPerson,
      phone,
      email,
      billingAddress,
      shippingAddress,
      taxId,
      creditLimit,
      creditTermDays,
    } = body

    // Check if code already exists
    const existing = await prisma.customer.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Customer code already exists' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        code,
        name,
        contactPerson,
        phone,
        email,
        billingAddress,
        shippingAddress,
        taxId,
        creditLimit: creditLimit || 0,
        creditTermDays: creditTermDays || 30,
      },
    })

    return NextResponse.json({ success: true, data: customer }, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}

