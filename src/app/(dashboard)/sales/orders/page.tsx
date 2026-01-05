'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, MoreHorizontal, ShoppingBag } from 'lucide-react'
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

interface SalesOrder {
  id: string
  soNumber: string
  orderDate: string
  deliveryDate: string | null
  totalAmount: number
  netAmount: number
  status: string
  customer: {
    name: string
    code: string
  }
  createdBy: {
    fullName: string
  }
  quotation: { quoteNumber: string } | null
  items: Array<{
    item: { name: string }
    quantityOrdered: number
    quantityDelivered: number
  }>
  deliveryChallans: Array<{ challanNumber: string }>
  salesInvoices: Array<{ invoiceNumber: string }>
}

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/sales/orders')
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
      case 'confirmed':
        return 'bg-blue-600'
      case 'processing':
        return 'bg-purple-600'
      case 'partial':
        return 'bg-yellow-600'
      case 'delivered':
        return 'bg-emerald-600'
      case 'closed':
        return 'bg-slate-600'
      case 'cancelled':
        return 'bg-red-600'
      default:
        return 'bg-slate-600'
    }
  }

  const columns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: 'soNumber',
      header: 'SO Number',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-emerald-400">{row.original.soNumber}</span>
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
      accessorKey: 'orderDate',
      header: 'Order Date',
      cell: ({ row }) => format(new Date(row.original.orderDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'quotation',
      header: 'Quotation',
      cell: ({ row }) =>
        row.original.quotation ? (
          <span className="font-mono text-blue-400">
            {row.original.quotation.quoteNumber}
          </span>
        ) : (
          '-'
        ),
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
      accessorKey: 'deliveryChallans',
      header: 'Challans',
      cell: ({ row }) => row.original.deliveryChallans.length || '-',
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
              <Link href={`/sales/orders/${row.original.id}`}>
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
          <h1 className="text-2xl font-bold text-white">Sales Orders</h1>
          <p className="text-slate-400">Manage confirmed sales orders</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/sales/orders/new">
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
          searchKey="soNumber"
          searchPlaceholder="Search orders..."
        />
      )}
    </div>
  )
}

