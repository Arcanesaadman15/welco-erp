import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, locationId, quantity, referenceType, referenceId, remarks } = body

    if (!itemId || !locationId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Item, location and quantity are required' },
        { status: 400 }
      )
    }

    // Check available stock
    const currentStock = await prisma.itemStock.findUnique({
      where: {
        itemId_locationId: { itemId, locationId },
      },
    })

    if (!currentStock || Number(currentStock.quantity) < Math.abs(quantity)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Create stock ledger entry
    const stockLedger = await prisma.stockLedger.create({
      data: {
        itemId,
        locationId,
        transactionType: 'sale',
        quantity: -Math.abs(quantity), // Negative for stock out
        referenceType,
        referenceId,
        remarks,
      },
    })

    // Update item stock
    await prisma.itemStock.update({
      where: {
        itemId_locationId: { itemId, locationId },
      },
      data: {
        quantity: { decrement: Math.abs(quantity) },
      },
    })

    return NextResponse.json({ success: true, data: stockLedger }, { status: 201 })
  } catch (error) {
    console.error('Error issuing stock:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to issue stock' },
      { status: 500 }
    )
  }
}

