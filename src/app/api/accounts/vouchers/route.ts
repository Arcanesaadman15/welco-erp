import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const voucherType = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''

    const vouchers = await prisma.voucher.findMany({
      where: {
        AND: [
          voucherType ? { voucherType } : {},
          status ? { status } : {},
        ],
      },
      include: {
        createdBy: true,
        approvedBy: true,
        glEntries: {
          include: {
            details: {
              include: { account: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: vouchers })
  } catch (error) {
    console.error('Error fetching vouchers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vouchers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voucherType, narrative, createdById, entries } = body

    // Generate voucher number
    const count = await prisma.voucher.count()
    const typePrefix = voucherType.substring(0, 2).toUpperCase()
    const voucherNumber = `${typePrefix}-${String(count + 1).padStart(5, '0')}`

    // Calculate total
    let totalAmount = 0
    entries.forEach((entry: { debit: number; credit: number }) => {
      totalAmount += entry.debit || entry.credit
    })

    const voucher = await prisma.voucher.create({
      data: {
        voucherNumber,
        voucherType,
        narrative,
        totalAmount: totalAmount / 2, // Since debits = credits
        createdById,
        glEntries: {
          create: {
            transactionDate: new Date(),
            description: narrative,
            details: {
              create: entries.map((entry: { accountId: string; debit: number; credit: number; narration?: string }) => ({
                accountId: entry.accountId,
                debit: entry.debit || 0,
                credit: entry.credit || 0,
                narration: entry.narration,
              })),
            },
          },
        },
      },
      include: {
        createdBy: true,
        glEntries: {
          include: {
            details: {
              include: { account: true },
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: voucher }, { status: 201 })
  } catch (error) {
    console.error('Error creating voucher:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create voucher' },
      { status: 500 }
    )
  }
}

