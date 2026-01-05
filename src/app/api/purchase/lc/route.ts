import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''

    const lcs = await prisma.letterOfCredit.findMany({
      where: status ? { status } : {},
      include: {
        supplier: true,
        purchaseOrders: true,
        lcCosts: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: lcs })
  } catch (error) {
    console.error('Error fetching LCs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch LCs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      lcNumber,
      supplierId,
      bankName,
      bankBranch,
      openingDate,
      shipmentDate,
      expiryDate,
      totalValue,
      currency,
      exchangeRate,
      remarks,
    } = body

    // Check if LC number already exists
    const existing = await prisma.letterOfCredit.findUnique({
      where: { lcNumber },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'LC number already exists' },
        { status: 400 }
      )
    }

    const lc = await prisma.letterOfCredit.create({
      data: {
        lcNumber,
        supplierId,
        bankName,
        bankBranch,
        openingDate: new Date(openingDate),
        shipmentDate: shipmentDate ? new Date(shipmentDate) : null,
        expiryDate: new Date(expiryDate),
        totalValue,
        currency: currency || 'USD',
        exchangeRate: exchangeRate || 1,
        remarks,
      },
      include: {
        supplier: true,
      },
    })

    return NextResponse.json({ success: true, data: lc }, { status: 201 })
  } catch (error) {
    console.error('Error creating LC:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create LC' },
      { status: 500 }
    )
  }
}

