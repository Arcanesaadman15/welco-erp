'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Wallet, AlertTriangle, TrendingUp, Clock } from 'lucide-react'

interface ReceivableInvoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  netAmount: number
  paidAmount: number
  balance: number
  daysOverdue: number
  status: string
  customer: {
    name: string
    code: string
  }
  salesOrder: { soNumber: string }
}

interface AgingData {
  current: number
  days30: number
  days60: number
  days90Plus: number
}

export default function ReceivablesPage() {
  const [invoices, setInvoices] = useState<ReceivableInvoice[]>([])
  const [aging, setAging] = useState<AgingData>({ current: 0, days30: 0, days60: 0, days90Plus: 0 })
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchReceivables = async () => {
    try {
      const response = await fetch('/api/accounts/receivables')
      const result = await response.json()
      if (result.success) {
        setInvoices(result.data.invoices)
        setAging(result.data.aging)
        setTotal(result.data.total)
      }
    } catch (error) {
      console.error('Error fetching receivables:', error)
      toast.error('Failed to fetch receivables')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReceivables()
  }, [])

  const columns: ColumnDef<ReceivableInvoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice No.',
      cell: ({ row }) => (
        <span className="font-mono text-purple-400">{row.original.invoiceNumber}</span>
      ),
    },
    {
      accessorKey: 'customer.name',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div>{row.original.customer.name}</div>
          <div className="text-xs text-slate-400">{row.original.customer.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'invoiceDate',
      header: 'Invoice Date',
      cell: ({ row }) => format(new Date(row.original.invoiceDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => format(new Date(row.original.dueDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'netAmount',
      header: 'Amount',
      cell: ({ row }) => `৳${Number(row.original.netAmount).toLocaleString()}`,
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid',
      cell: ({ row }) => `৳${Number(row.original.paidAmount).toLocaleString()}`,
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => (
        <span className="text-red-400 font-medium">
          ৳{Number(row.original.balance).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'daysOverdue',
      header: 'Overdue',
      cell: ({ row }) => {
        const days = row.original.daysOverdue
        if (days === 0) return <Badge className="bg-emerald-600">Current</Badge>
        if (days <= 30) return <Badge className="bg-yellow-600">{days} days</Badge>
        if (days <= 60) return <Badge className="bg-orange-600">{days} days</Badge>
        return <Badge className="bg-red-600">{days} days</Badge>
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Accounts Receivable</h1>
        <p className="text-slate-400">Customer outstanding payments and aging analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-400" />
              Total Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">৳{total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Current
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">৳{aging.current.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              1-30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">৳{aging.days30.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              31-60 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">৳{aging.days60.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              60+ Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">৳{aging.days90Plus.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          searchKey="invoiceNumber"
          searchPlaceholder="Search invoices..."
        />
      )}
    </div>
  )
}

