import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const orderType = searchParams.get('orderType') || ''

    const orders = await prisma.purchaseOrder.findMany({
      where: {
        AND: [
          status ? { status } : {},
          orderType ? { orderType } : {},
        ],
      },
      include: {
        supplier: true,
        purchaseRequisition: true,
        letterOfCredit: true,
        items: {
          include: { item: true },
        },
        approvedBy: true,
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
      supplierId,
      prId,
      lcId,
      orderType,
      expectedDate,
      remarks,
      items,
    } = body

    // Generate PO number
    const count = await prisma.purchaseOrder.count()
    const poNumber = `PO-${String(count + 1).padStart(5, '0')}`

    // Calculate totals
    let totalAmount = 0
    let taxAmount = 0
    const poItems = items.map((item: { itemId: string; quantityOrdered: number; unitPrice: number; taxRate?: number }) => {
      const itemTotal = item.quantityOrdered * item.unitPrice
      const itemTax = itemTotal * (item.taxRate || 0) / 100
      totalAmount += itemTotal
      taxAmount += itemTax

      return {
        itemId: item.itemId,
        quantityOrdered: item.quantityOrdered,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || 0,
        totalPrice: itemTotal,
      }
    })

    const order = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        prId: prId || null,
        lcId: lcId || null,
        orderType: orderType || 'local',
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        totalAmount,
        taxAmount,
        remarks,
        items: {
          create: poItems,
        },
      },
      include: {
        supplier: true,
        items: {
          include: { item: true },
        },
      },
    })

    // Update PR status if linked
    if (prId) {
      await prisma.purchaseRequisition.update({
        where: { id: prId },
        data: { status: 'converted' },
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

