import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''

    const suppliers = await prisma.supplier.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
          type ? { type } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: suppliers })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suppliers' },
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
      type,
      ultimateSupplier,
      contactPerson,
      phone,
      email,
      address,
      country,
      taxId,
      bankDetails,
      creditTermDays,
    } = body

    // Check if code already exists
    const existing = await prisma.supplier.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Supplier code already exists' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.create({
      data: {
        code,
        name,
        type: type || 'local',
        ultimateSupplier,
        contactPerson,
        phone,
        email,
        address,
        country,
        taxId,
        bankDetails,
        creditTermDays: creditTermDays || 30,
      },
    })

    return NextResponse.json({ success: true, data: supplier }, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}

