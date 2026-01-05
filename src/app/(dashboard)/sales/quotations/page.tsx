'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, MoreHorizontal, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Quotation {
  id: string
  quoteNumber: string
  quoteDate: string
  validUntil: string
  totalAmount: number
  netAmount: number
  status: string
  version: number
  customer: {
    name: string
    code: string
  }
  createdBy: {
    fullName: string
  }
  items: Array<{
    item: { name: string }
    quantity: number
  }>
  salesOrder: { soNumber: string } | null
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchQuotations = async () => {
    try {
      const response = await fetch('/api/sales/quotations')
      const result = await response.json()
      if (result.success) {
        setQuotations(result.data)
      }
    } catch (error) {
      console.error('Error fetching quotations:', error)
      toast.error('Failed to fetch quotations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotations()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-600'
      case 'sent':
        return 'bg-blue-600'
      case 'revised':
        return 'bg-purple-600'
      case 'accepted':
        return 'bg-emerald-600'
      case 'rejected':
        return 'bg-red-600'
      case 'expired':
        return 'bg-yellow-600'
      default:
        return 'bg-slate-600'
    }
  }

  const columns: ColumnDef<Quotation>[] = [
    {
      accessorKey: 'quoteNumber',
      header: 'Quote No.',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-400" />
          <span className="font-mono text-blue-400">{row.original.quoteNumber}</span>
          {row.original.version > 1 && (
            <Badge variant="secondary" className="text-xs">v{row.original.version}</Badge>
          )}
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
      accessorKey: 'quoteDate',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.quoteDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'validUntil',
      header: 'Valid Until',
      cell: ({ row }) => {
        const validUntil = new Date(row.original.validUntil)
        const isExpired = validUntil < new Date()
        return (
          <span className={isExpired ? 'text-red-400' : 'text-slate-300'}>
            {format(validUntil, 'dd MMM yyyy')}
          </span>
        )
      },
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => `${row.original.items.length} item(s)`,
    },
    {
      accessorKey: 'netAmount',
      header: 'Amount',
      cell: ({ row }) => `৳${Number(row.original.netAmount).toLocaleString()}`,
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
      accessorKey: 'salesOrder',
      header: 'SO',
      cell: ({ row }) =>
        row.original.salesOrder ? (
          <span className="font-mono text-emerald-400">
            {row.original.salesOrder.soNumber}
          </span>
        ) : (
          '-'
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
              <Link href={`/sales/quotations/${row.original.id}`}>
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
          <h1 className="text-2xl font-bold text-white">Quotations</h1>
          <p className="text-slate-400">Manage customer quotations</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/sales/quotations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
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
          data={quotations}
          searchKey="quoteNumber"
          searchPlaceholder="Search quotations..."
        />
      )}
    </div>
  )
}

