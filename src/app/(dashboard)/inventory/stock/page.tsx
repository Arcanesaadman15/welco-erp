'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Barcode, AlertTriangle, Package } from 'lucide-react'
import { toast } from 'sonner'

interface ItemStock {
  id: string
  quantity: number
  item: {
    id: string
    code: string
    name: string
    unitOfMeasure: string
    minStockLevel: number
    category: { name: string } | null
    barcodes: { barcodeString: string }[]
  }
  location: {
    id: string
    name: string
  }
}

interface Location {
  id: string
  name: string
  code: string
}

export default function StockPage() {
  const [stocks, setStocks] = useState<ItemStock[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      const result = await response.json()
      if (result.success) {
        setLocations(result.data)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const fetchStock = async () => {
    try {
      setLoading(true)
      const url = selectedLocation && selectedLocation !== 'all'
        ? `/api/inventory/stock?locationId=${selectedLocation}`
        : '/api/inventory/stock'
      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        setStocks(result.data)
      }
    } catch (error) {
      console.error('Error fetching stock:', error)
      toast.error('Failed to fetch stock')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    fetchStock()
  }, [selectedLocation])

  const lowStockItems = stocks.filter(
    (s) => Number(s.quantity) <= Number(s.item.minStockLevel)
  )

  const columns: ColumnDef<ItemStock>[] = [
    {
      accessorKey: 'item.code',
      header: 'Code',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Barcode className="h-4 w-4 text-slate-400" />
          <span className="font-mono text-emerald-400">{row.original.item.code}</span>
        </div>
      ),
    },
    {
      accessorKey: 'item.name',
      header: 'Item Name',
    },
    {
      accessorKey: 'item.category',
      header: 'Category',
      cell: ({ row }) => row.original.item.category?.name || '-',
    },
    {
      accessorKey: 'location.name',
      header: 'Location',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => {
        const qty = Number(row.original.quantity)
        const minLevel = Number(row.original.item.minStockLevel)
        const isLow = qty <= minLevel

        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? 'text-red-400' : 'text-white'}>
              {qty} {row.original.item.unitOfMeasure}
            </span>
            {isLow && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
          </div>
        )
      },
    },
    {
      accessorKey: 'item.minStockLevel',
      header: 'Min Level',
      cell: ({ row }) => `${Number(row.original.item.minStockLevel)} ${row.original.item.unitOfMeasure}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const qty = Number(row.original.quantity)
        const minLevel = Number(row.original.item.minStockLevel)

        if (qty <= 0) {
          return <Badge variant="destructive">Out of Stock</Badge>
        }
        if (qty <= minLevel) {
          return <Badge variant="secondary" className="bg-yellow-600">Low Stock</Badge>
        }
        return <Badge variant="default" className="bg-emerald-600">In Stock</Badge>
      },
    },
    {
      accessorKey: 'barcode',
      header: 'Barcode',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-400">
          {row.original.item.barcodes[0]?.barcodeString || '-'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock Overview</h1>
          <p className="text-slate-400">View current stock levels across locations</p>
        </div>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-400" />
              <span className="text-2xl font-bold text-white">{stocks.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">{lowStockItems.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-white">{locations.length}</span>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={stocks}
          searchKey="item.name"
          searchPlaceholder="Search items..."
        />
      )}
    </div>
  )
}

