import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const challans = await prisma.deliveryChallan.findMany({
      include: {
        salesOrder: {
          include: { customer: true },
        },
        items: {
          include: { item: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: challans })
  } catch (error) {
    console.error('Error fetching challans:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { soId, driverName, vehicleNumber, remarks, items } = body

    // Generate challan number
    const count = await prisma.deliveryChallan.count()
    const challanNumber = `DC-${String(count + 1).padStart(5, '0')}`

    const challan = await prisma.deliveryChallan.create({
      data: {
        challanNumber,
        soId,
        driverName,
        vehicleNumber,
        remarks,
        items: {
          create: items.map((item: { itemId: string; quantityDelivered: number }) => ({
            itemId: item.itemId,
            quantityDelivered: item.quantityDelivered,
          })),
        },
      },
      include: {
        salesOrder: {
          include: { customer: true },
        },
        items: {
          include: { item: true },
        },
      },
    })

    // Update SO item quantities delivered
    for (const item of items) {
      await prisma.sOItem.updateMany({
        where: {
          soId,
          itemId: item.itemId,
        },
        data: {
          quantityDelivered: { increment: item.quantityDelivered },
        },
      })
    }

    return NextResponse.json({ success: true, data: challan }, { status: 201 })
  } catch (error) {
    console.error('Error creating challan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create challan' },
      { status: 500 }
    )
  }
}

