'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Check, X, Users } from 'lucide-react'
import { toast } from 'sonner'

interface Permission {
  id: string
  module: string
  action: string
}

interface Role {
  id: string
  name: string
  description: string | null
  permissions: Permission[]
  _count: {
    users: number
  }
}

const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'master_data', label: 'Master Data' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'purchase', label: 'Purchase' },
  { key: 'sales', label: 'Sales' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
  { key: 'admin', label: 'Admin Panel' },
]

const ACTIONS = ['read', 'write', 'delete', 'approve']

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/roles')
      const result = await response.json()
      if (result.success) {
        setRoles(result.data)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const hasPermission = (role: Role, module: string, action: string) => {
    return role.permissions.some(
      (p) => p.module === module && p.action === action
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" />
            Roles & Permissions
          </h1>
          <p className="text-slate-400">View role permissions and access levels</p>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className={`h-5 w-5 ${
                    role.name === 'Admin' ? 'text-purple-400' :
                    role.name === 'Manager' ? 'text-blue-400' : 'text-slate-400'
                  }`} />
                  {role.name}
                </CardTitle>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {role._count.users}
                </Badge>
              </div>
              <CardDescription className="text-slate-400">
                {role.description || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-300">
                <span className="font-medium">{role.permissions.length}</span> permissions assigned
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Permission Matrix</CardTitle>
          <CardDescription className="text-slate-400">
            Overview of all permissions by role and module
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Module</th>
                <th className="text-center py-3 px-2 text-slate-300 font-medium">Action</th>
                {roles.map((role) => (
                  <th key={role.id} className="text-center py-3 px-4 text-slate-300 font-medium">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((module) => (
                ACTIONS.map((action, actionIdx) => (
                  <tr 
                    key={`${module.key}-${action}`} 
                    className={`border-b border-slate-700/50 ${actionIdx === 0 ? 'bg-slate-700/20' : ''}`}
                  >
                    <td className="py-2 px-4 text-slate-200">
                      {actionIdx === 0 ? module.label : ''}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <Badge variant="outline" className="text-xs capitalize">
                        {action}
                      </Badge>
                    </td>
                    {roles.map((role) => (
                      <td key={`${role.id}-${module.key}-${action}`} className="py-2 px-4 text-center">
                        {hasPermission(role, module.key, action) ? (
                          <Check className="h-4 w-4 text-emerald-400 inline" />
                        ) : (
                          <X className="h-4 w-4 text-slate-600 inline" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-slate-500">
        <p>
          Note: To modify role permissions, please contact your system administrator or edit the seed file directly.
        </p>
      </div>
    </div>
  )
}

