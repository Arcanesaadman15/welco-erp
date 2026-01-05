'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, MoreHorizontal, Receipt } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import { toast } from 'sonner'

interface SalesInvoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  netAmount: number
  paidAmount: number
  status: string
  customer: {
    name: string
    code: string
  }
  salesOrder: { soNumber: string }
  items: Array<{
    item: { name: string }
    quantity: number
  }>
  payments: Array<{ amount: number }>
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/sales/invoices')
      const result = await response.json()
      if (result.success) {
        setInvoices(result.data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid':
        return 'bg-red-600'
      case 'partial':
        return 'bg-yellow-600'
      case 'paid':
        return 'bg-emerald-600'
      default:
        return 'bg-slate-600'
    }
  }

  const getAgingBadge = (dueDate: string, status: string) => {
    if (status === 'paid') return null
    const days = differenceInDays(new Date(), new Date(dueDate))
    if (days <= 0) return null
    if (days <= 30) return <Badge className="bg-yellow-600">{days}d overdue</Badge>
    if (days <= 60) return <Badge className="bg-orange-600">{days}d overdue</Badge>
    return <Badge className="bg-red-600">{days}d overdue</Badge>
  }

  const columns: ColumnDef<SalesInvoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice No.',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-purple-400" />
          <span className="font-mono text-purple-400">{row.original.invoiceNumber}</span>
        </div>
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
      accessorKey: 'salesOrder.soNumber',
      header: 'SO',
      cell: ({ row }) => (
        <span className="font-mono text-emerald-400">
          {row.original.salesOrder.soNumber}
        </span>
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
      cell: ({ row }) => (
        <div className="space-y-1">
          <div>{format(new Date(row.original.dueDate), 'dd MMM yyyy')}</div>
          {getAgingBadge(row.original.dueDate, row.original.status)}
        </div>
      ),
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
      cell: ({ row }) => {
        const balance = Number(row.original.netAmount) - Number(row.original.paidAmount)
        return (
          <span className={balance > 0 ? 'text-red-400' : 'text-emerald-400'}>
            ৳{balance.toLocaleString()}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/sales/invoices/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Invoices</h1>
          <p className="text-slate-400">Manage customer invoices and receivables</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/sales/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
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

