import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const locationId = searchParams.get('locationId') || ''

    const itemStocks = await prisma.itemStock.findMany({
      where: {
        AND: [
          locationId ? { locationId } : {},
          {
            item: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      },
      include: {
        item: {
          include: {
            category: true,
            barcodes: true,
          },
        },
        location: true,
      },
      orderBy: { item: { name: 'asc' } },
    })

    return NextResponse.json({ success: true, data: itemStocks })
  } catch (error) {
    console.error('Error fetching stock:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock' },
      { status: 500 }
    )
  }
}

