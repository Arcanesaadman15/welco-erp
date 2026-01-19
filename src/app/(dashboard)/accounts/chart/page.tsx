'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, MoreHorizontal, Folder, File } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AccountFormDialog } from './account-form-dialog'
import { toast } from 'sonner'

interface ChartOfAccounts {
  id: string
  code: string
  name: string
  accountType: string
  description: string | null
  balance: number
  isActive: boolean
  parentId: string | null
  parent: { code: string; name: string } | null
  children: Array<{ id: string }>
}

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<ChartOfAccounts[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<ChartOfAccounts | null>(null)

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts/chart')
      const result = await response.json()
      if (result.success) {
        setAccounts(result.data)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('Failed to fetch accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'asset':
        return 'bg-blue-600'
      case 'liability':
        return 'bg-purple-600'
      case 'equity':
        return 'bg-emerald-600'
      case 'income':
        return 'bg-green-600'
      case 'expense':
        return 'bg-red-600'
      default:
        return 'bg-slate-600'
    }
  }

  const columns: ColumnDef<ChartOfAccounts>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.children.length > 0 ? (
            <Folder className="h-4 w-4 text-yellow-400" />
          ) : (
            <File className="h-4 w-4 text-slate-400" />
          )}
          <span className="font-mono text-emerald-400">{row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Account Name',
    },
    {
      accessorKey: 'accountType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge className={getTypeColor(row.original.accountType)}>
          {row.original.accountType.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'parent',
      header: 'Parent Account',
      cell: ({ row }) =>
        row.original.parent ? (
          <span className="text-slate-400">
            {row.original.parent.code} - {row.original.parent.name}
          </span>
        ) : (
          '-'
        ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => {
        const balance = Number(row.original.balance)
        const isDebit = ['asset', 'expense'].includes(row.original.accountType)
        return (
          <span className={balance >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            ৳{Math.abs(balance).toLocaleString()}
            {balance !== 0 && (isDebit ? ' Dr' : ' Cr')}
          </span>
        )
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.original.description || '-',
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
            <DropdownMenuItem
              onClick={() => {
                setEditingAccount(row.original)
                setDialogOpen(true)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
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
          <h1 className="text-2xl font-bold text-white">Chart of Accounts</h1>
          <p className="text-slate-400">Manage your ledger accounts</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={accounts}
          searchKey="name"
          searchPlaceholder="Search accounts..."
        />
      )}

      <AccountFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingAccount(null)
        }}
        onSuccess={() => {
          setDialogOpen(false)
          setEditingAccount(null)
          fetchAccounts()
        }}
        account={editingAccount}
        accounts={accounts}
      />
    </div>
  )
}

