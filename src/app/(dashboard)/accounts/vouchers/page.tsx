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

interface Voucher {
  id: string
  voucherNumber: string
  voucherType: string
  voucherDate: string
  narrative: string | null
  totalAmount: number
  status: string
  createdBy: {
    fullName: string
  }
  approvedBy: {
    fullName: string
  } | null
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVouchers = async () => {
    try {
      const response = await fetch('/api/accounts/vouchers')
      const result = await response.json()
      if (result.success) {
        setVouchers(result.data)
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error)
      toast.error('Failed to fetch vouchers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-red-600'
      case 'receipt':
        return 'bg-emerald-600'
      case 'journal':
        return 'bg-blue-600'
      case 'contra':
        return 'bg-purple-600'
      default:
        return 'bg-slate-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-600'
      case 'pending':
        return 'bg-yellow-600'
      case 'approved':
        return 'bg-blue-600'
      case 'posted':
        return 'bg-emerald-600'
      case 'cancelled':
        return 'bg-red-600'
      default:
        return 'bg-slate-600'
    }
  }

  const columns: ColumnDef<Voucher>[] = [
    {
      accessorKey: 'voucherNumber',
      header: 'Voucher No.',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-400" />
          <span className="font-mono text-blue-400">{row.original.voucherNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: 'voucherType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge className={getTypeColor(row.original.voucherType)}>
          {row.original.voucherType.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'voucherDate',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.voucherDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'narrative',
      header: 'Description',
      cell: ({ row }) => row.original.narrative || '-',
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => `৳${Number(row.original.totalAmount).toLocaleString()}`,
    },
    {
      accessorKey: 'createdBy.fullName',
      header: 'Created By',
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
              <Link href={`/accounts/vouchers/${row.original.id}`}>
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
          <h1 className="text-2xl font-bold text-white">Vouchers</h1>
          <p className="text-slate-400">Manage payment, receipt, and journal vouchers</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/accounts/vouchers/new">
            <Plus className="mr-2 h-4 w-4" />
            New Voucher
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
          data={vouchers}
          searchKey="voucherNumber"
          searchPlaceholder="Search vouchers..."
        />
      )}
    </div>
  )
}

