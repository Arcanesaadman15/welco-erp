'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react'
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

interface PurchaseRequisition {
  id: string
  prNumber: string
  requestDate: string
  requiredDate: string | null
  priority: string
  status: string
  remarks: string | null
  requestedBy: {
    fullName: string
  }
  items: Array<{
    item: { name: string }
    quantityRequested: number
  }>
  purchaseOrder: { poNumber: string } | null
}

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequisitions = async () => {
    try {
      const response = await fetch('/api/purchase/requisitions')
      const result = await response.json()
      if (result.success) {
        setRequisitions(result.data)
      }
    } catch (error) {
      console.error('Error fetching requisitions:', error)
      toast.error('Failed to fetch requisitions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequisitions()
  }, [])

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/purchase/requisitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success(`Requisition ${status}`)
        fetchRequisitions()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error updating requisition:', error)
      toast.error('Failed to update requisition')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600'
      case 'approved':
        return 'bg-emerald-600'
      case 'rejected':
        return 'bg-red-600'
      case 'converted':
        return 'bg-blue-600'
      default:
        return 'bg-slate-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400'
      case 'high':
        return 'text-orange-400'
      case 'normal':
        return 'text-slate-300'
      case 'low':
        return 'text-slate-500'
      default:
        return 'text-slate-300'
    }
  }

  const columns: ColumnDef<PurchaseRequisition>[] = [
    {
      accessorKey: 'prNumber',
      header: 'PR Number',
      cell: ({ row }) => (
        <span className="font-mono text-emerald-400">{row.original.prNumber}</span>
      ),
    },
    {
      accessorKey: 'requestDate',
      header: 'Request Date',
      cell: ({ row }) => format(new Date(row.original.requestDate), 'dd MMM yyyy'),
    },
    {
      accessorKey: 'requestedBy.fullName',
      header: 'Requested By',
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => `${row.original.items.length} item(s)`,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <span className={`font-medium uppercase text-xs ${getPriorityColor(row.original.priority)}`}>
          {row.original.priority}
        </span>
      ),
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
      accessorKey: 'purchaseOrder',
      header: 'PO',
      cell: ({ row }) =>
        row.original.purchaseOrder ? (
          <span className="font-mono text-blue-400">
            {row.original.purchaseOrder.poNumber}
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
              <Link href={`/purchase/requisitions/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            {row.original.status === 'pending' && (
              <>
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(row.original.id, 'approved')}
                  className="text-emerald-500"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(row.original.id, 'rejected')}
                  className="text-red-500"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchase Requisitions</h1>
          <p className="text-slate-400">Manage internal purchase requests</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/purchase/requisitions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Requisition
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
          data={requisitions}
          searchKey="prNumber"
          searchPlaceholder="Search requisitions..."
        />
      )}
    </div>
  )
}

