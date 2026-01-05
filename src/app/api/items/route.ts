import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    const items = await prisma.item.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          },
          category ? { categoryId: category } : {},
        ],
      },
      include: {
        category: true,
        itemStocks: {
          include: { location: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
    } = body

    // Check if code already exists
    const existing = await prisma.item.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Item code already exists' },
        { status: 400 }
      )
    }

    const item = await prisma.item.create({
      data: {
        code,
        name,
        description,
        categoryId: categoryId || null,
        unitOfMeasure,
        hsCode,
        countryOfOrigin,
        minStockLevel: minStockLevel || 0,
        reorderPoint: reorderPoint || 0,
        costPrice: costPrice || 0,
        sellingPrice: sellingPrice || 0,
        taxRate: taxRate || 0,
      },
      include: { category: true },
    })

    // Generate barcode
    await prisma.barcode.create({
      data: {
        itemId: item.id,
        barcodeString: `WLC-${item.code}-${Date.now()}`,
        format: 'CODE128',
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 500 }
    )
  }
}

