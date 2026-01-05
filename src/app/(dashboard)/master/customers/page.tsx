'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, MoreHorizontal, Mail, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CustomerFormDialog } from './customer-form-dialog'
import { toast } from 'sonner'

interface Customer {
  id: string
  code: string
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  billingAddress: string | null
  creditLimit: number
  balance: number
  isActive: boolean
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const result = await response.json()
      if (result.success) {
        setCustomers(result.data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const response = await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        toast.success('Customer deleted successfully')
        fetchCustomers()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingCustomer(null)
  }

  const handleSuccess = () => {
    handleDialogClose()
    fetchCustomers()
  }

  const columns: ColumnDef<Customer>[] = [
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
      accessorKey: 'contactPerson',
      header: 'Contact Person',
      cell: ({ row }) => row.original.contactPerson || '-',
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3 text-slate-400" />
              <span className="text-slate-300">{row.original.email}</span>
            </div>
          )}
          {row.original.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3 text-slate-400" />
              <span className="text-slate-300">{row.original.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'creditLimit',
      header: 'Credit Limit',
      cell: ({ row }) => `৳${Number(row.original.creditLimit).toLocaleString()}`,
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => {
        const balance = Number(row.original.balance)
        return (
          <span className={balance > 0 ? 'text-yellow-400' : 'text-emerald-400'}>
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
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400">Manage your customer directory</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          searchKey="name"
          searchPlaceholder="Search customers..."
        />
      )}

      <CustomerFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleSuccess}
        customer={editingCustomer}
      />
    </div>
  )
}

