import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lc = await prisma.letterOfCredit.findUnique({
      where: { id },
      include: {
        supplier: true,
        purchaseOrders: {
          include: {
            items: { include: { item: true } },
          },
        },
        lcCosts: true,
        landedCostAllocations: {
          include: { item: true },
        },
      },
    })

    if (!lc) {
      return NextResponse.json(
        { success: false, error: 'LC not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: lc })
  } catch (error) {
    console.error('Error fetching LC:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch LC' },
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

    const lc = await prisma.letterOfCredit.update({
      where: { id },
      data: body,
      include: {
        supplier: true,
        lcCosts: true,
      },
    })

    return NextResponse.json({ success: true, data: lc })
  } catch (error) {
    console.error('Error updating LC:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update LC' },
      { status: 500 }
    )
  }
}

