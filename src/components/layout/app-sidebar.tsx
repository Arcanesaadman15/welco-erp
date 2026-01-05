'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Building2,
  Boxes,
  Receipt,
  Wallet,
  Settings,
  ChevronDown,
  LogOut,
  CreditCard,
  FileBarChart,
  ClipboardList,
  Truck,
  Shield,
  UserCog,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { hasPermission, type ModuleName, type ActionType } from '@/lib/permissions'
import { Badge } from '@/components/ui/badge'

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  module: ModuleName
  action: ActionType
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const menuItems: MenuGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard', action: 'read' },
    ],
  },
  {
    title: 'Master Data',
    items: [
      { title: 'Items', href: '/master/items', icon: Boxes, module: 'master_data', action: 'read' },
      { title: 'Customers', href: '/master/customers', icon: Users, module: 'master_data', action: 'read' },
      { title: 'Suppliers', href: '/master/suppliers', icon: Building2, module: 'master_data', action: 'read' },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { title: 'Stock', href: '/inventory/stock', icon: Package, module: 'inventory', action: 'read' },
      { title: 'Stock In', href: '/inventory/receive', icon: ClipboardList, module: 'inventory', action: 'write' },
      { title: 'Stock Out', href: '/inventory/issue', icon: Truck, module: 'inventory', action: 'write' },
      { title: 'Stock Ledger', href: '/inventory/ledger', icon: FileBarChart, module: 'inventory', action: 'read' },
    ],
  },
  {
    title: 'Purchase',
    items: [
      { title: 'Requisitions', href: '/purchase/requisitions', icon: ClipboardList, module: 'purchase', action: 'read' },
      { title: 'Orders', href: '/purchase/orders', icon: ShoppingCart, module: 'purchase', action: 'read' },
      { title: 'Letter of Credit', href: '/purchase/lc', icon: CreditCard, module: 'purchase', action: 'read' },
    ],
  },
  {
    title: 'Sales',
    items: [
      { title: 'Quotations', href: '/sales/quotations', icon: FileText, module: 'sales', action: 'read' },
      { title: 'Orders', href: '/sales/orders', icon: ShoppingCart, module: 'sales', action: 'read' },
      { title: 'Delivery', href: '/sales/delivery', icon: Truck, module: 'sales', action: 'read' },
      { title: 'Invoices', href: '/sales/invoices', icon: Receipt, module: 'sales', action: 'read' },
    ],
  },
  {
    title: 'Accounts',
    items: [
      { title: 'Chart of Accounts', href: '/accounts/chart', icon: FileBarChart, module: 'accounts', action: 'read' },
      { title: 'Vouchers', href: '/accounts/vouchers', icon: Receipt, module: 'accounts', action: 'read' },
      { title: 'Receivables', href: '/accounts/receivables', icon: Wallet, module: 'accounts', action: 'read' },
      { title: 'Payables', href: '/accounts/payables', icon: CreditCard, module: 'accounts', action: 'read' },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Settings', href: '/settings', icon: Settings, module: 'settings', action: 'read' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { title: 'Users', href: '/admin/users', icon: UserCog, module: 'admin', action: 'read' },
      { title: 'Roles & Permissions', href: '/admin/roles', icon: Shield, module: 'admin', action: 'read' },
    ],
  },
]

interface AppSidebarProps {
  user: {
    name: string
    email: string
    role: string
    permissions?: { module: string; action: string }[]
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const userPermissions = user.permissions || []

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  // Filter menu groups based on permissions
  const filteredMenuItems = menuItems
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        hasPermission(userPermissions, item.module, item.action)
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar className="border-r border-slate-700 bg-slate-900">
      <SidebarHeader className="border-b border-slate-700 p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
            W
          </div>
          <span className="text-lg font-semibold text-white">Welco ERP</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        {filteredMenuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-slate-400 text-xs uppercase tracking-wider mb-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`${
                          isActive
                            ? 'bg-emerald-600/20 text-emerald-400 border-l-2 border-emerald-400'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-700 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-800 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-600 text-white text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <Badge variant={
                user.role === 'Admin' ? 'destructive' : 
                user.role === 'Manager' ? 'default' : 'secondary'
              } className={
                user.role === 'Admin' ? 'bg-purple-600' : 
                user.role === 'Manager' ? 'bg-blue-600' : ''
              }>
                {user.role}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
