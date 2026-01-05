import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: { take: 10, orderBy: { createdAt: 'desc' } },
        lettersOfCredit: { take: 10, orderBy: { createdAt: 'desc' } },
        supplierBills: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: supplier })
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supplier' },
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

    const supplier = await prisma.supplier.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ success: true, data: supplier })
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update supplier' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, message: 'Supplier deleted' })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete supplier' },
      { status: 500 }
    )
  }
}

