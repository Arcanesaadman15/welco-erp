import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { differenceInDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get('customerId') || ''

    const invoices = await prisma.salesInvoice.findMany({
      where: {
        AND: [
          customerId ? { customerId } : {},
          { status: { not: 'paid' } },
        ],
      },
      include: {
        customer: true,
        salesOrder: true,
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

    const enrichedInvoices = invoices.map((invoice) => {
      const balance = Number(invoice.netAmount) - Number(invoice.paidAmount)
      const daysOverdue = differenceInDays(now, new Date(invoice.dueDate))

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
        ...invoice,
        balance,
        daysOverdue: Math.max(0, daysOverdue),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        invoices: enrichedInvoices,
        aging,
        total: aging.current + aging.days30 + aging.days60 + aging.days90Plus,
      },
    })
  } catch (error) {
    console.error('Error fetching receivables:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch receivables' },
      { status: 500 }
    )
  }
}

