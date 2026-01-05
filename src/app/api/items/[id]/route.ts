import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        barcodes: true,
        itemStocks: {
          include: { location: true },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch item' },
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
    const {
      code,
      name,
      description,
      categoryId,
      unitOfMeasure,
      hsCode,
      countryOfOrigin,
      minStockLevel,
      reorderPoint,
      costPrice,
      sellingPrice,
      taxRate,
      isActive,
    } = body

    // Check if code already exists for another item
    if (code) {
      const existing = await prisma.item.findFirst({
        where: { code, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Item code already exists' },
          { status: 400 }
        )
      }
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        code,
        name,
        description,
        categoryId: categoryId || null,
        unitOfMeasure,
        hsCode,
        countryOfOrigin,
        minStockLevel,
        reorderPoint,
        costPrice,
        sellingPrice,
        taxRate,
        isActive,
      },
      include: { category: true },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update item' },
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
    
    // Soft delete - just mark as inactive
    await prisma.item.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, message: 'Item deleted' })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}

