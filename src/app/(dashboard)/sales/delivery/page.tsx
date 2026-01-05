'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, MoreHorizontal, Truck } from 'lucide-react'
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

interface DeliveryChallan {
  id: string
  challanNumber: string
  deliveryDate: string
  driverName: string | null
  vehicleNumber: string | null
  receivedBy: string | null
  status: string
  salesOrder: {
    soNumber: string
    customer: {
      name: string
    }
  }
  items: Array<{
    item: { name: string }
    quantityDelivered: number
  }>
}

export default function DeliveryPage() {
  const [challans, setChallans] = useState<DeliveryChallan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChallans = async () => {
    try {
      const response = await fetch('/api/sales/delivery')
      const result = await response.json()
      if (result.success) {
        setChallans(result.data)
      }
    } catch (error) {
      console.error('Error fetching challans:', error)
      toast.error('Failed to fetch delivery challans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChallans()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600'
      case 'dispatched':
        return 'bg-blue-600'
      case 'delivered':
        return 'bg-emerald-600'
      default:
        return 'bg-slate-600'
    }
  }

  const columns: ColumnDef<DeliveryChallan>[] = [
    {
      accessorKey: 'challanNumber',
      header: 'Challan No.',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-orange-400" />
          <span className="font-mono text-orange-400">{row.original.challanNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: 'salesOrder.soNumber',
      header: 'SO Number',
      cell: ({ row }) => (
        <span className="font-mono text-emerald-400">
          {row.original.salesOrder.soNumber}
        </span>
      ),
    },
    {
      accessorKey: 'salesOrder.customer.name',
      header: 'Customer',
    },
    {
      accessorKey: 'deliveryDate',
      header: 'Delivery Date',
      cell: ({ row }) => format(new Date(row.original.deliveryDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => `${row.original.items.length} item(s)`,
    },
    {
      accessorKey: 'driverName',
      header: 'Driver',
      cell: ({ row }) => row.original.driverName || '-',
    },
    {
      accessorKey: 'vehicleNumber',
      header: 'Vehicle',
      cell: ({ row }) => row.original.vehicleNumber || '-',
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
              <Link href={`/sales/delivery/${row.original.id}`}>
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
          <h1 className="text-2xl font-bold text-white">Delivery Challans</h1>
          <p className="text-slate-400">Manage delivery documentation</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/sales/delivery/new">
            <Plus className="mr-2 h-4 w-4" />
            New Challan
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
          data={challans}
          searchKey="challanNumber"
          searchPlaceholder="Search challans..."
        />
      )}
    </div>
  )
}

