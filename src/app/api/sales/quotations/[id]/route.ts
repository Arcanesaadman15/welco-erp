import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: true,
        items: {
          include: { item: true },
        },
        salesOrder: true,
      },
    })

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: quotation })
  } catch (error) {
    console.error('Error fetching quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotation' },
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

    const quotation = await prisma.quotation.update({
      where: { id },
      data: { status, remarks },
      include: {
        customer: true,
        items: {
          include: { item: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: quotation })
  } catch (error) {
    console.error('Error updating quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update quotation' },
      { status: 500 }
    )
  }
}

