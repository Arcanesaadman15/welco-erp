import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      paymentType,
      partyType,
      customerId,
      supplierId,
      amount,
      paymentMode,
      referenceNumber,
      bankName,
      invoiceId,
      billId,
      remarks,
    } = body

    // Generate payment number
    const count = await prisma.payment.count()
    const prefix = paymentType === 'incoming' ? 'RCV' : 'PAY'
    const paymentNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`

    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        paymentType,
        partyType,
        customerId: customerId || null,
        supplierId: supplierId || null,
        amount,
        paymentMode,
        referenceNumber,
        bankName,
        invoiceId: invoiceId || null,
        billId: billId || null,
        remarks,
      },
    })

    // Update invoice or bill status
    if (invoiceId) {
      const invoice = await prisma.salesInvoice.findUnique({ where: { id: invoiceId } })
      if (invoice) {
        const newPaidAmount = Number(invoice.paidAmount) + amount
        const newStatus = newPaidAmount >= Number(invoice.netAmount) ? 'paid' : 'partial'
        await prisma.salesInvoice.update({
          where: { id: invoiceId },
          data: {
            paidAmount: newPaidAmount,
            status: newStatus,
          },
        })

        // Update customer balance
        if (customerId) {
          await prisma.customer.update({
            where: { id: customerId },
            data: {
              balance: { decrement: amount },
            },
          })
        }
      }
    }

    if (billId) {
      const bill = await prisma.supplierBill.findUnique({ where: { id: billId } })
      if (bill) {
        const newPaidAmount = Number(bill.paidAmount) + amount
        const newStatus = newPaidAmount >= Number(bill.totalAmount) ? 'paid' : 'partial'
        await prisma.supplierBill.update({
          where: { id: billId },
          data: {
            paidAmount: newPaidAmount,
            status: newStatus,
          },
        })

        // Update supplier balance
        if (supplierId) {
          await prisma.supplier.update({
            where: { id: supplierId },
            data: {
              balance: { decrement: amount },
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

