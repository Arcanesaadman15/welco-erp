'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, MoreHorizontal, Globe, Building } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SupplierFormDialog } from './supplier-form-dialog'
import { toast } from 'sonner'

interface Supplier {
  id: string
  code: string
  name: string
  type: string
  ultimateSupplier: string | null
  contactPerson: string | null
  phone: string | null
  email: string | null
  country: string | null
  balance: number
  isActive: boolean
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      const result = await response.json()
      if (result.success) {
        setSuppliers(result.data)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      toast.error('Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return

    try {
      const response = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        toast.success('Supplier deleted successfully')
        fetchSuppliers()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Failed to delete supplier')
    }
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingSupplier(null)
  }

  const handleSuccess = () => {
    handleDialogClose()
    fetchSuppliers()
  }

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-emerald-400">{row.original.code}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant={row.original.type === 'foreign' ? 'default' : 'secondary'}>
          {row.original.type === 'foreign' ? (
            <><Globe className="mr-1 h-3 w-3" /> Foreign</>
          ) : (
            <><Building className="mr-1 h-3 w-3" /> Local</>
          )}
        </Badge>
      ),
    },
    {
      accessorKey: 'ultimateSupplier',
      header: 'Ultimate Supplier',
      cell: ({ row }) => row.original.ultimateSupplier || '-',
    },
    {
      accessorKey: 'country',
      header: 'Country',
      cell: ({ row }) => row.original.country || '-',
    },
    {
      accessorKey: 'contactPerson',
      header: 'Contact',
      cell: ({ row }) => row.original.contactPerson || '-',
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => {
        const balance = Number(row.original.balance)
        return (
          <span className={balance > 0 ? 'text-red-400' : 'text-emerald-400'}>
            ৳{balance.toLocaleString()}
          </span>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
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
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id)}
              className="text-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
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
          <h1 className="text-2xl font-bold text-white">Suppliers</h1>
          <p className="text-slate-400">Manage your supplier directory</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={suppliers}
          searchKey="name"
          searchPlaceholder="Search suppliers..."
        />
      )}

      <SupplierFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleSuccess}
        supplier={editingSupplier}
      />
    </div>
  )
}

