import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  ShoppingCart, 
  Receipt, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Clock
} from 'lucide-react'
import prisma from '@/lib/prisma'

async function getDashboardStats() {
  try {
    const [
      totalItems,
      totalCustomers,
      totalSuppliers,
      pendingPRs,
      pendingPOs,
      pendingQuotations,
    ] = await Promise.all([
      prisma.item.count({ where: { isActive: true } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.purchaseRequisition.count({ where: { status: 'pending' } }),
      prisma.purchaseOrder.count({ where: { status: 'issued' } }),
      prisma.quotation.count({ where: { status: 'sent' } }),
    ])

    return {
      totalItems,
      totalCustomers,
      totalSuppliers,
      pendingPRs,
      pendingPOs,
      pendingQuotations,
    }
  } catch {
    // Return defaults if database not set up yet
    return {
      totalItems: 0,
      totalCustomers: 0,
      totalSuppliers: 0,
      pendingPRs: 0,
      pendingPOs: 0,
      pendingQuotations: 0,
    }
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Welcome to Welco ERP System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Items</CardTitle>
            <Package className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalItems}</div>
            <p className="text-xs text-slate-400">Active inventory items</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Customers</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalCustomers}</div>
            <p className="text-xs text-slate-400">Active customers</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Suppliers</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalSuppliers}</div>
            <p className="text-xs text-slate-400">Active suppliers</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pending PRs</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingPRs}</div>
            <p className="text-xs text-slate-400">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-400" />
              Pending Orders
            </CardTitle>
            <CardDescription className="text-slate-400">
              Purchase orders awaiting delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.pendingPOs}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-400" />
              Active Quotations
            </CardTitle>
            <CardDescription className="text-slate-400">
              Quotations sent to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.pendingQuotations}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription className="text-slate-400">
              Items below minimum level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Receivables Overview</CardTitle>
            <CardDescription className="text-slate-400">
              Outstanding customer payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">0-30 Days</span>
              <span className="text-emerald-400 font-medium">৳0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">31-60 Days</span>
              <span className="text-yellow-400 font-medium">৳0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">60+ Days</span>
              <span className="text-red-400 font-medium">৳0</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Payables Overview</CardTitle>
            <CardDescription className="text-slate-400">
              Outstanding supplier payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">0-30 Days</span>
              <span className="text-emerald-400 font-medium">৳0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">31-60 Days</span>
              <span className="text-yellow-400 font-medium">৳0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">60+ Days</span>
              <span className="text-red-400 font-medium">৳0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

