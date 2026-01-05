'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, MoreHorizontal } from 'lucide-react'
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

interface PurchaseOrder {
  id: string
  poNumber: string
  orderDate: string
  expectedDate: string | null
  orderType: string
  totalAmount: number
  status: string
  approvalStatus: string
  supplier: {
    name: string
    type: string
  }
  items: Array<{
    item: { name: string }
    quantityOrdered: number
  }>
  letterOfCredit: { lcNumber: string } | null
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/purchase/orders')
      const result = await response.json()
      if (result.success) {
        setOrders(result.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-blue-600'
      case 'partial':
        return 'bg-yellow-600'
      case 'received':
        return 'bg-emerald-600'
      case 'closed':
        return 'bg-slate-600'
      case 'cancelled':
        return 'bg-red-600'
      default:
        return 'bg-slate-600'
    }
  }

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'poNumber',
      header: 'PO Number',
      cell: ({ row }) => (
        <span className="font-mono text-emerald-400">{row.original.poNumber}</span>
      ),
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      cell: ({ row }) => format(new Date(row.original.orderDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'supplier.name',
      header: 'Supplier',
    },
    {
      accessorKey: 'orderType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant={row.original.orderType === 'foreign' ? 'default' : 'secondary'}>
          {row.original.orderType.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => `${row.original.items.length} item(s)`,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => `৳${Number(row.original.totalAmount).toLocaleString()}`,
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
      accessorKey: 'letterOfCredit',
      header: 'LC',
      cell: ({ row }) =>
        row.original.letterOfCredit ? (
          <span className="font-mono text-purple-400">
            {row.original.letterOfCredit.lcNumber}
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
              <Link href={`/purchase/orders/${row.original.id}`}>
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
          <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
          <p className="text-slate-400">Manage purchase orders to suppliers</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/purchase/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
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
          data={orders}
          searchKey="poNumber"
          searchPlaceholder="Search orders..."
        />
      )}
    </div>
  )
}

