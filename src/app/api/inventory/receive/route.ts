import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, locationId, quantity, unitCost, referenceType, referenceId, remarks } = body

    if (!itemId || !locationId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Item, location and quantity are required' },
        { status: 400 }
      )
    }

    // Create stock ledger entry
    const stockLedger = await prisma.stockLedger.create({
      data: {
        itemId,
        locationId,
        transactionType: 'purchase',
        quantity: Math.abs(quantity), // Positive for stock in
        unitCost,
        referenceType,
        referenceId,
        remarks,
      },
    })

    // Update or create item stock
    await prisma.itemStock.upsert({
      where: {
        itemId_locationId: { itemId, locationId },
      },
      update: {
        quantity: { increment: Math.abs(quantity) },
      },
      create: {
        itemId,
        locationId,
        quantity: Math.abs(quantity),
      },
    })

    // Update item cost price if provided (weighted average could be implemented here)
    if (unitCost) {
      await prisma.item.update({
        where: { id: itemId },
        data: { costPrice: unitCost },
      })
    }

    return NextResponse.json({ success: true, data: stockLedger }, { status: 201 })
  } catch (error) {
    console.error('Error receiving stock:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to receive stock' },
      { status: 500 }
    )
  }
}

