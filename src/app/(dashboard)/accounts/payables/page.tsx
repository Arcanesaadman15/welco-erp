'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CreditCard, AlertTriangle, TrendingDown, Clock } from 'lucide-react'

interface PayableBill {
  id: string
  billNumber: string
  billDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  balance: number
  daysOverdue: number
  status: string
  supplier: {
    name: string
    code: string
  }
  purchaseOrder: { poNumber: string }
}

interface AgingData {
  current: number
  days30: number
  days60: number
  days90Plus: number
}

export default function PayablesPage() {
  const [bills, setBills] = useState<PayableBill[]>([])
  const [aging, setAging] = useState<AgingData>({ current: 0, days30: 0, days60: 0, days90Plus: 0 })
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchPayables = async () => {
    try {
      const response = await fetch('/api/accounts/payables')
      const result = await response.json()
      if (result.success) {
        setBills(result.data.bills)
        setAging(result.data.aging)
        setTotal(result.data.total)
      }
    } catch (error) {
      console.error('Error fetching payables:', error)
      toast.error('Failed to fetch payables')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayables()
  }, [])

  const columns: ColumnDef<PayableBill>[] = [
    {
      accessorKey: 'billNumber',
      header: 'Bill No.',
      cell: ({ row }) => (
        <span className="font-mono text-orange-400">{row.original.billNumber}</span>
      ),
    },
    {
      accessorKey: 'supplier.name',
      header: 'Supplier',
      cell: ({ row }) => (
        <div>
          <div>{row.original.supplier.name}</div>
          <div className="text-xs text-slate-400">{row.original.supplier.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'purchaseOrder.poNumber',
      header: 'PO',
      cell: ({ row }) => (
        <span className="font-mono text-emerald-400">
          {row.original.purchaseOrder.poNumber}
        </span>
      ),
    },
    {
      accessorKey: 'billDate',
      header: 'Bill Date',
      cell: ({ row }) => format(new Date(row.original.billDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => format(new Date(row.original.dueDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => `৳${Number(row.original.totalAmount).toLocaleString()}`,
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
        <h1 className="text-2xl font-bold text-white">Accounts Payable</h1>
        <p className="text-slate-400">Supplier outstanding payments and aging analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-red-400" />
              Total Payable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">৳{total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-400" />
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
          data={bills}
          searchKey="billNumber"
          searchPlaceholder="Search bills..."
        />
      )}
    </div>
  )
}

