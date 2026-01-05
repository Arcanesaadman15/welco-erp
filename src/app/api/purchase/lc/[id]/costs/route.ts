import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { costType, description, amount, currency, exchangeRate, referenceDoc } = body

    const cost = await prisma.lCCost.create({
      data: {
        lcId: id,
        costType,
        description,
        amount,
        currency: currency || 'BDT',
        exchangeRate: exchangeRate || 1,
        referenceDoc,
      },
    })

    return NextResponse.json({ success: true, data: cost }, { status: 201 })
  } catch (error) {
    console.error('Error adding LC cost:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add LC cost' },
      { status: 500 }
    )
  }
}

