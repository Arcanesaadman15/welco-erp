// Role-Based Access Control (RBAC) Permissions System

export type ModuleName = 
  | 'dashboard'
  | 'master_data'
  | 'inventory'
  | 'purchase'
  | 'sales'
  | 'accounts'
  | 'reports'
  | 'settings'
  | 'admin'

export type ActionType = 'read' | 'write' | 'delete' | 'approve'

export interface Permission {
  module: ModuleName
  action: ActionType
}

// Default permissions for each role
export const DEFAULT_PERMISSIONS: Record<string, Permission[]> = {
  Admin: [
    // Dashboard
    { module: 'dashboard', action: 'read' },
    // Master Data
    { module: 'master_data', action: 'read' },
    { module: 'master_data', action: 'write' },
    { module: 'master_data', action: 'delete' },
    // Inventory
    { module: 'inventory', action: 'read' },
    { module: 'inventory', action: 'write' },
    { module: 'inventory', action: 'delete' },
    { module: 'inventory', action: 'approve' },
    // Purchase
    { module: 'purchase', action: 'read' },
    { module: 'purchase', action: 'write' },
    { module: 'purchase', action: 'delete' },
    { module: 'purchase', action: 'approve' },
    // Sales
    { module: 'sales', action: 'read' },
    { module: 'sales', action: 'write' },
    { module: 'sales', action: 'delete' },
    { module: 'sales', action: 'approve' },
    // Accounts
    { module: 'accounts', action: 'read' },
    { module: 'accounts', action: 'write' },
    { module: 'accounts', action: 'delete' },
    { module: 'accounts', action: 'approve' },
    // Reports
    { module: 'reports', action: 'read' },
    // Settings
    { module: 'settings', action: 'read' },
    { module: 'settings', action: 'write' },
    // Admin Panel
    { module: 'admin', action: 'read' },
    { module: 'admin', action: 'write' },
    { module: 'admin', action: 'delete' },
  ],
  Manager: [
    // Dashboard
    { module: 'dashboard', action: 'read' },
    // Master Data
    { module: 'master_data', action: 'read' },
    { module: 'master_data', action: 'write' },
    // Inventory
    { module: 'inventory', action: 'read' },
    { module: 'inventory', action: 'write' },
    { module: 'inventory', action: 'approve' },
    // Purchase
    { module: 'purchase', action: 'read' },
    { module: 'purchase', action: 'write' },
    { module: 'purchase', action: 'approve' },
    // Sales
    { module: 'sales', action: 'read' },
    { module: 'sales', action: 'write' },
    { module: 'sales', action: 'approve' },
    // Accounts
    { module: 'accounts', action: 'read' },
    { module: 'accounts', action: 'write' },
    // Reports
    { module: 'reports', action: 'read' },
  ],
  User: [
    // Dashboard
    { module: 'dashboard', action: 'read' },
    // Master Data
    { module: 'master_data', action: 'read' },
    // Inventory
    { module: 'inventory', action: 'read' },
    { module: 'inventory', action: 'write' },
    // Purchase
    { module: 'purchase', action: 'read' },
    { module: 'purchase', action: 'write' },
    // Sales
    { module: 'sales', action: 'read' },
    { module: 'sales', action: 'write' },
  ],
}

// Route to module mapping
export const ROUTE_PERMISSIONS: Record<string, { module: ModuleName; action: ActionType }> = {
  '/dashboard': { module: 'dashboard', action: 'read' },
  '/master/items': { module: 'master_data', action: 'read' },
  '/master/customers': { module: 'master_data', action: 'read' },
  '/master/suppliers': { module: 'master_data', action: 'read' },
  '/inventory/stock': { module: 'inventory', action: 'read' },
  '/inventory/receive': { module: 'inventory', action: 'write' },
  '/inventory/issue': { module: 'inventory', action: 'write' },
  '/inventory/ledger': { module: 'inventory', action: 'read' },
  '/purchase/requisitions': { module: 'purchase', action: 'read' },
  '/purchase/orders': { module: 'purchase', action: 'read' },
  '/purchase/lc': { module: 'purchase', action: 'read' },
  '/sales/quotations': { module: 'sales', action: 'read' },
  '/sales/orders': { module: 'sales', action: 'read' },
  '/sales/delivery': { module: 'sales', action: 'read' },
  '/sales/invoices': { module: 'sales', action: 'read' },
  '/accounts/chart': { module: 'accounts', action: 'read' },
  '/accounts/vouchers': { module: 'accounts', action: 'read' },
  '/accounts/receivables': { module: 'accounts', action: 'read' },
  '/accounts/payables': { module: 'accounts', action: 'read' },
  '/settings': { module: 'settings', action: 'read' },
  '/admin': { module: 'admin', action: 'read' },
  '/admin/users': { module: 'admin', action: 'read' },
  '/admin/roles': { module: 'admin', action: 'read' },
}

// Check if user has a specific permission
export function hasPermission(
  userPermissions: { module: string; action: string }[],
  module: ModuleName,
  action: ActionType
): boolean {
  return userPermissions.some(
    (p) => p.module === module && p.action === action
  )
}

// Check if user can access a specific route
export function canAccessRoute(
  userPermissions: { module: string; action: string }[],
  pathname: string
): boolean {
  // Find the matching route permission
  const routeKey = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
  
  if (!routeKey) {
    // If no specific permission required, allow access
    return true
  }

  const required = ROUTE_PERMISSIONS[routeKey]
  return hasPermission(userPermissions, required.module, required.action)
}

// Get all permissions for a role
export function getDefaultPermissionsForRole(roleName: string): Permission[] {
  return DEFAULT_PERMISSIONS[roleName] || []
}

