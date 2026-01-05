import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const customerId = searchParams.get('customerId') || ''

    const quotations = await prisma.quotation.findMany({
      where: {
        AND: [
          status ? { status } : {},
          customerId ? { customerId } : {},
        ],
      },
      include: {
        customer: true,
        createdBy: true,
        items: {
          include: { item: true },
        },
        salesOrder: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: quotations })
  } catch (error) {
    console.error('Error fetching quotations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerId,
      createdById,
      validUntil,
      discountAmount,
      remarks,
      terms,
      items,
    } = body

    // Generate quote number
    const count = await prisma.quotation.count()
    const quoteNumber = `QT-${String(count + 1).padStart(5, '0')}`

    // Calculate totals
    let totalAmount = 0
    let taxAmount = 0
    const quoteItems = items.map((item: { itemId: string; quantity: number; unitPrice: number; discount?: number; taxRate?: number; description?: string }) => {
      const itemTotal = item.quantity * item.unitPrice - (item.discount || 0)
      const itemTax = itemTotal * (item.taxRate || 0) / 100
      totalAmount += itemTotal
      taxAmount += itemTax

      return {
        itemId: item.itemId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        taxRate: item.taxRate || 0,
        totalPrice: itemTotal,
      }
    })

    const netAmount = totalAmount + taxAmount - (discountAmount || 0)

    const quotation = await prisma.quotation.create({
      data: {
        quoteNumber,
        customerId,
        createdById,
        validUntil: new Date(validUntil),
        totalAmount,
        discountAmount: discountAmount || 0,
        taxAmount,
        netAmount,
        remarks,
        terms,
        items: {
          create: quoteItems,
        },
      },
      include: {
        customer: true,
        items: {
          include: { item: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: quotation }, { status: 201 })
  } catch (error) {
    console.error('Error creating quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create quotation' },
      { status: 500 }
    )
  }
}

