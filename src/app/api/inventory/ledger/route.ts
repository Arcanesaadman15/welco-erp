import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const itemId = searchParams.get('itemId') || ''
    const locationId = searchParams.get('locationId') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const ledger = await prisma.stockLedger.findMany({
      where: {
        AND: [
          itemId ? { itemId } : {},
          locationId ? { locationId } : {},
          startDate ? { transactionDate: { gte: new Date(startDate) } } : {},
          endDate ? { transactionDate: { lte: new Date(endDate) } } : {},
        ],
      },
      include: {
        item: true,
        location: true,
      },
      orderBy: { transactionDate: 'desc' },
      take: 500,
    })

    return NextResponse.json({ success: true, data: ledger })
  } catch (error) {
    console.error('Error fetching stock ledger:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock ledger' },
      { status: 500 }
    )
  }
}

