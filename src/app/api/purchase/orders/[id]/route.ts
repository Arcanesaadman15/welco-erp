import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        purchaseRequisition: {
          include: {
            items: { include: { item: true } },
          },
        },
        letterOfCredit: true,
        items: {
          include: { item: true },
        },
        approvedBy: true,
        supplierBills: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, approvalStatus, approvedById, remarks } = body

    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        approvalStatus,
        approvedById,
        remarks,
      },
      include: {
        supplier: true,
        items: {
          include: { item: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

