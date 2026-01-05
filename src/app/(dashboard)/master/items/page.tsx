'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, MoreHorizontal, Barcode } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ItemFormDialog } from './item-form-dialog'
import { toast } from 'sonner'

interface Item {
  id: string
  code: string
  name: string
  description: string | null
  unitOfMeasure: string
  hsCode: string | null
  countryOfOrigin: string | null
  minStockLevel: number
  costPrice: number
  sellingPrice: number
  isActive: boolean
  category: { id: string; name: string } | null
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items')
      const result = await response.json()
      if (result.success) {
        setItems(result.data)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        toast.success('Item deleted successfully')
        fetchItems()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingItem(null)
  }

  const handleSuccess = () => {
    handleDialogClose()
    fetchItems()
  }

  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Barcode className="h-4 w-4 text-slate-400" />
          <span className="font-mono text-emerald-400">{row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.category?.name || '-',
    },
    {
      accessorKey: 'unitOfMeasure',
      header: 'Unit',
    },
    {
      accessorKey: 'costPrice',
      header: 'Cost Price',
      cell: ({ row }) => `৳${Number(row.original.costPrice).toLocaleString()}`,
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Selling Price',
      cell: ({ row }) => `৳${Number(row.original.sellingPrice).toLocaleString()}`,
    },
    {
      accessorKey: 'minStockLevel',
      header: 'Min Stock',
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
          <h1 className="text-2xl font-bold text-white">Items</h1>
          <p className="text-slate-400">Manage your product catalog</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchKey="name"
          searchPlaceholder="Search items..."
        />
      )}

      <ItemFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleSuccess}
        item={editingItem}
      />
    </div>
  )
}

