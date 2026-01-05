import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const requisition = await prisma.purchaseRequisition.findUnique({
      where: { id },
      include: {
        requestedBy: true,
        items: {
          include: { item: true },
        },
        supplierQuotations: {
          include: { supplier: true },
        },
        purchaseOrder: true,
      },
    })

    if (!requisition) {
      return NextResponse.json(
        { success: false, error: 'Requisition not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: requisition })
  } catch (error) {
    console.error('Error fetching requisition:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requisition' },
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
    const { status, remarks } = body

    const requisition = await prisma.purchaseRequisition.update({
      where: { id },
      data: { status, remarks },
      include: {
        requestedBy: true,
        items: {
          include: { item: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: requisition })
  } catch (error) {
    console.error('Error updating requisition:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update requisition' },
      { status: 500 }
    )
  }
}

