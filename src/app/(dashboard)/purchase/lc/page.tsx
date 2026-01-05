'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, MoreHorizontal, CreditCard } from 'lucide-react'
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
import { LCFormDialog } from './lc-form-dialog'

interface LetterOfCredit {
  id: string
  lcNumber: string
  bankName: string
  openingDate: string
  expiryDate: string
  shipmentDate: string | null
  totalValue: number
  currency: string
  status: string
  supplier: {
    name: string
    country: string | null
  }
  purchaseOrders: Array<{ poNumber: string }>
  lcCosts: Array<{ amount: number }>
}

export default function LCPage() {
  const [lcs, setLCs] = useState<LetterOfCredit[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchLCs = async () => {
    try {
      const response = await fetch('/api/purchase/lc')
      const result = await response.json()
      if (result.success) {
        setLCs(result.data)
      }
    } catch (error) {
      console.error('Error fetching LCs:', error)
      toast.error('Failed to fetch LCs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLCs()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-600'
      case 'shipped':
        return 'bg-purple-600'
      case 'documents_received':
        return 'bg-yellow-600'
      case 'cleared':
        return 'bg-emerald-600'
      case 'closed':
        return 'bg-slate-600'
      default:
        return 'bg-slate-600'
    }
  }

  const columns: ColumnDef<LetterOfCredit>[] = [
    {
      accessorKey: 'lcNumber',
      header: 'LC Number',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-purple-400" />
          <span className="font-mono text-purple-400">{row.original.lcNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: 'supplier.name',
      header: 'Supplier',
      cell: ({ row }) => (
        <div>
          <div>{row.original.supplier.name}</div>
          <div className="text-xs text-slate-400">{row.original.supplier.country}</div>
        </div>
      ),
    },
    {
      accessorKey: 'bankName',
      header: 'Bank',
    },
    {
      accessorKey: 'openingDate',
      header: 'Opening Date',
      cell: ({ row }) => format(new Date(row.original.openingDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ row }) => format(new Date(row.original.expiryDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'totalValue',
      header: 'Value',
      cell: ({ row }) =>
        `${row.original.currency} ${Number(row.original.totalValue).toLocaleString()}`,
    },
    {
      accessorKey: 'lcCosts',
      header: 'Landed Costs',
      cell: ({ row }) => {
        const totalCost = row.original.lcCosts.reduce((sum, cost) => sum + Number(cost.amount), 0)
        return `৳${totalCost.toLocaleString()}`
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status.replace('_', ' ').toUpperCase()}
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
              <Link href={`/purchase/lc/${row.original.id}`}>
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
          <h1 className="text-2xl font-bold text-white">Letters of Credit</h1>
          <p className="text-slate-400">Manage import LCs for foreign purchases</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New LC
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={lcs}
          searchKey="lcNumber"
          searchPlaceholder="Search LCs..."
        />
      )}

      <LCFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false)
          fetchLCs()
        }}
      />
    </div>
  )
}

