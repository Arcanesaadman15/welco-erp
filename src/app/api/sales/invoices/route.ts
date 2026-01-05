import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const customerId = searchParams.get('customerId') || ''

    const invoices = await prisma.salesInvoice.findMany({
      where: {
        AND: [
          status ? { status } : {},
          customerId ? { customerId } : {},
        ],
      },
      include: {
        customer: true,
        salesOrder: true,
        deliveryChallan: true,
        items: {
          include: { item: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: invoices })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      soId,
      challanId,
      customerId,
      dueDate,
      discountAmount,
      items,
    } = body

    // Generate invoice number
    const count = await prisma.salesInvoice.count()
    const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`

    // Calculate totals
    let totalAmount = 0
    let taxAmount = 0
    const invoiceItems = items.map((item: { itemId: string; quantity: number; unitPrice: number; discount?: number; taxRate?: number; description?: string }) => {
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
        taxAmount: itemTax,
        totalPrice: itemTotal + itemTax,
      }
    })

    const netAmount = totalAmount + taxAmount - (discountAmount || 0)

    const invoice = await prisma.salesInvoice.create({
      data: {
        invoiceNumber,
        soId,
        challanId: challanId || null,
        customerId,
        dueDate: new Date(dueDate),
        totalAmount,
        discountAmount: discountAmount || 0,
        taxAmount,
        netAmount,
        items: {
          create: invoiceItems,
        },
      },
      include: {
        customer: true,
        items: {
          include: { item: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: invoice }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

