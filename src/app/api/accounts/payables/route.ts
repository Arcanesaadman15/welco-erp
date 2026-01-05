import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { differenceInDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const supplierId = searchParams.get('supplierId') || ''

    const bills = await prisma.supplierBill.findMany({
      where: {
        AND: [
          supplierId ? { supplierId } : {},
          { status: { not: 'paid' } },
        ],
      },
      include: {
        supplier: true,
        purchaseOrder: true,
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    })

    // Calculate aging
    const now = new Date()
    const aging = {
      current: 0,
      days30: 0,
      days60: 0,
      days90Plus: 0,
    }

    const enrichedBills = bills.map((bill) => {
      const balance = Number(bill.totalAmount) - Number(bill.paidAmount)
      const daysOverdue = differenceInDays(now, new Date(bill.dueDate))

      if (daysOverdue <= 0) {
        aging.current += balance
      } else if (daysOverdue <= 30) {
        aging.days30 += balance
      } else if (daysOverdue <= 60) {
        aging.days60 += balance
      } else {
        aging.days90Plus += balance
      }

      return {
        ...bill,
        balance,
        daysOverdue: Math.max(0, daysOverdue),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        bills: enrichedBills,
        aging,
        total: aging.current + aging.days30 + aging.days60 + aging.days90Plus,
      },
    })
  } catch (error) {
    console.error('Error fetching payables:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payables' },
      { status: 500 }
    )
  }
}

