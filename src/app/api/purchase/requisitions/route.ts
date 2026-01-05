import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''

    const requisitions = await prisma.purchaseRequisition.findMany({
      where: status ? { status } : {},
      include: {
        requestedBy: true,
        items: {
          include: { item: true },
        },
        purchaseOrder: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: requisitions })
  } catch (error) {
    console.error('Error fetching requisitions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requisitions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestedById, requiredDate, priority, remarks, items } = body

    // Generate PR number
    const count = await prisma.purchaseRequisition.count()
    const prNumber = `PR-${String(count + 1).padStart(5, '0')}`

    const requisition = await prisma.purchaseRequisition.create({
      data: {
        prNumber,
        requestedById,
        requiredDate: requiredDate ? new Date(requiredDate) : null,
        priority: priority || 'normal',
        remarks,
        items: {
          create: items.map((item: { itemId: string; quantityRequested: number; remarks?: string }) => ({
            itemId: item.itemId,
            quantityRequested: item.quantityRequested,
            remarks: item.remarks,
          })),
        },
      },
      include: {
        requestedBy: true,
        items: {
          include: { item: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: requisition }, { status: 201 })
  } catch (error) {
    console.error('Error creating requisition:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create requisition' },
      { status: 500 }
    )
  }
}

