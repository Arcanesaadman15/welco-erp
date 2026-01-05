'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Role is required'),
  departmentId: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof formSchema>

interface Role {
  id: string
  name: string
}

interface Department {
  id: string
  name: string
}

interface User {
  id: string
  email: string
  fullName: string
  phone: string | null
  status: string
  role: { id: string; name: string } | null
  department: { id: string; name: string } | null
}

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSuccess: () => void
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      phone: '',
      roleId: '',
      departmentId: 'none',
      status: 'active',
    },
  })

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [rolesRes, deptsRes] = await Promise.all([
          fetch('/api/admin/roles'),
          fetch('/api/admin/departments'),
        ])
        const rolesData = await rolesRes.json()
        const deptsData = await deptsRes.json()
        
        if (rolesData.success) setRoles(rolesData.data)
        if (deptsData.success) setDepartments(deptsData.data)
      } catch (error) {
        console.error('Error fetching options:', error)
      }
    }
    
    if (open) {
      fetchOptions()
    }
  }, [open])

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        password: '',
        fullName: user.fullName,
        phone: user.phone || '',
        roleId: user.role?.id || '',
        departmentId: user.department?.id || 'none',
        status: user.status as 'active' | 'inactive',
      })
    } else {
      form.reset({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        roleId: '',
        departmentId: 'none',
        status: 'active',
      })
    }
  }, [user, form, open])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)

    try {
      const payload = {
        ...values,
        departmentId: values.departmentId === 'none' ? null : values.departmentId,
        // Only include password if it's set
        ...(values.password ? { password: values.password } : {}),
      }

      const response = await fetch(
        user ? `/api/admin/users/${user.id}` : '/api/admin/users',
        {
          method: user ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const result = await response.json()

      if (response.ok) {
        toast.success(user ? 'User updated successfully' : 'User created successfully')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to save user')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {user ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {user ? 'Update user details and permissions' : 'Create a new user account'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="john@company.com"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">
                    Password {user && <span className="text-slate-400 text-xs">(leave blank to keep current)</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={user ? '••••••••' : 'Enter password'}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="+880 1234567890"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Department (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {user ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

