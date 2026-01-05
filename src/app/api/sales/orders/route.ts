import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const customerId = searchParams.get('customerId') || ''

    const orders = await prisma.salesOrder.findMany({
      where: {
        AND: [
          status ? { status } : {},
          customerId ? { customerId } : {},
        ],
      },
      include: {
        customer: true,
        createdBy: true,
        quotation: true,
        items: {
          include: { item: true },
        },
        deliveryChallans: true,
        salesInvoices: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      quoteId,
      customerId,
      createdById,
      deliveryDate,
      discountAmount,
      remarks,
      items,
    } = body

    // Generate SO number
    const count = await prisma.salesOrder.count()
    const soNumber = `SO-${String(count + 1).padStart(5, '0')}`

    // Calculate totals
    let totalAmount = 0
    let taxAmount = 0
    const soItems = items.map((item: { itemId: string; quantityOrdered: number; unitPrice: number; discount?: number; taxRate?: number; description?: string }) => {
      const itemTotal = item.quantityOrdered * item.unitPrice - (item.discount || 0)
      const itemTax = itemTotal * (item.taxRate || 0) / 100
      totalAmount += itemTotal
      taxAmount += itemTax

      return {
        itemId: item.itemId,
        description: item.description,
        quantityOrdered: item.quantityOrdered,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        taxRate: item.taxRate || 0,
        totalPrice: itemTotal,
      }
    })

    const netAmount = totalAmount + taxAmount - (discountAmount || 0)

    const order = await prisma.salesOrder.create({
      data: {
        soNumber,
        quoteId: quoteId || null,
        customerId,
        createdById,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        totalAmount,
        discountAmount: discountAmount || 0,
        taxAmount,
        netAmount,
        remarks,
        items: {
          create: soItems,
        },
      },
      include: {
        customer: true,
        items: {
          include: { item: true },
        },
      },
    })

    // Update quotation status if linked
    if (quoteId) {
      await prisma.quotation.update({
        where: { id: quoteId },
        data: { status: 'accepted' },
      })
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

