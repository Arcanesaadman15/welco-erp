'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface StockLedgerEntry {
  id: string
  transactionType: string
  quantity: number
  unitCost: number | null
  referenceType: string | null
  referenceId: string | null
  remarks: string | null
  transactionDate: string
  item: {
    code: string
    name: string
    unitOfMeasure: string
  }
  location: {
    name: string
  }
}

interface Item {
  id: string
  code: string
  name: string
}

interface Location {
  id: string
  name: string
}

export default function StockLedgerPage() {
  const [entries, setEntries] = useState<StockLedgerEntry[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    itemId: 'all',
    locationId: 'all',
    startDate: '',
    endDate: '',
  })

  const fetchData = async () => {
    try {
      const [itemsRes, locationsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/locations'),
      ])
      const itemsData = await itemsRes.json()
      const locationsData = await locationsRes.json()

      if (itemsData.success) setItems(itemsData.data)
      if (locationsData.success) setLocations(locationsData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchLedger = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.itemId && filters.itemId !== 'all') params.append('itemId', filters.itemId)
      if (filters.locationId && filters.locationId !== 'all') params.append('locationId', filters.locationId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/inventory/ledger?${params}`)
      const result = await response.json()
      if (result.success) {
        setEntries(result.data)
      }
    } catch (error) {
      console.error('Error fetching ledger:', error)
      toast.error('Failed to fetch stock ledger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchLedger()
  }, [])

  const columns: ColumnDef<StockLedgerEntry>[] = [
    {
      accessorKey: 'transactionDate',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.transactionDate), 'dd MMM yyyy HH:mm'),
    },
    {
      accessorKey: 'item.code',
      header: 'Item Code',
      cell: ({ row }) => (
        <span className="font-mono text-emerald-400">{row.original.item.code}</span>
      ),
    },
    {
      accessorKey: 'item.name',
      header: 'Item Name',
    },
    {
      accessorKey: 'location.name',
      header: 'Location',
    },
    {
      accessorKey: 'transactionType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.transactionType
        const isIn = ['purchase', 'transfer_in', 'return'].includes(type)
        return (
          <div className="flex items-center gap-2">
            {isIn ? (
              <ArrowDownCircle className="h-4 w-4 text-emerald-400" />
            ) : (
              <ArrowUpCircle className="h-4 w-4 text-red-400" />
            )}
            <Badge variant={isIn ? 'default' : 'secondary'}>
              {type.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => {
        const qty = Number(row.original.quantity)
        return (
          <span className={qty >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {qty > 0 ? '+' : ''}{qty} {row.original.item.unitOfMeasure}
          </span>
        )
      },
    },
    {
      accessorKey: 'unitCost',
      header: 'Unit Cost',
      cell: ({ row }) =>
        row.original.unitCost ? `৳${Number(row.original.unitCost).toLocaleString()}` : '-',
    },
    {
      accessorKey: 'referenceType',
      header: 'Reference',
      cell: ({ row }) =>
        row.original.referenceType
          ? `${row.original.referenceType} #${row.original.referenceId || ''}`
          : '-',
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => row.original.remarks || '-',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock Ledger</h1>
          <p className="text-slate-400">View all stock movement history</p>
        </div>
        <Button
          onClick={fetchLedger}
          variant="outline"
          className="bg-slate-800 border-slate-700"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-slate-300">Filters:</span>
        </div>
        
        <Select value={filters.itemId} onValueChange={(v) => setFilters((f) => ({ ...f, itemId: v }))}>
          <SelectTrigger className="w-[200px] bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="All Items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.code} - {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.locationId} onValueChange={(v) => setFilters((f) => ({ ...f, locationId: v }))}>
          <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
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

        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
          className="w-[150px] bg-slate-700 border-slate-600 text-white"
          placeholder="Start Date"
        />

        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
          className="w-[150px] bg-slate-700 border-slate-600 text-white"
          placeholder="End Date"
        />

        <Button onClick={fetchLedger} className="bg-emerald-600 hover:bg-emerald-700">
          Apply Filters
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={entries}
          searchKey="item.name"
          searchPlaceholder="Search entries..."
        />
      )}
    </div>
  )
}

