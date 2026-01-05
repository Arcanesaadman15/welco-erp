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
import { Textarea } from '@/components/ui/textarea'
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
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['local', 'foreign']),
  ultimateSupplier: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  bankDetails: z.string().optional(),
  creditTermDays: z.number().min(0),
})

type FormValues = z.infer<typeof formSchema>

interface Supplier {
  id: string
  code: string
  name: string
  type: string
  ultimateSupplier: string | null
  contactPerson: string | null
  phone: string | null
  email: string | null
  address?: string | null
  country: string | null
  taxId?: string | null
  bankDetails?: string | null
  creditTermDays?: number
}

interface SupplierFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  supplier: Supplier | null
}

export function SupplierFormDialog({ open, onClose, onSuccess, supplier }: SupplierFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!supplier

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'local',
      ultimateSupplier: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      country: '',
      taxId: '',
      bankDetails: '',
      creditTermDays: 30,
    },
  })

  useEffect(() => {
    if (supplier) {
      form.reset({
        code: supplier.code,
        name: supplier.name,
        type: supplier.type as 'local' | 'foreign',
        ultimateSupplier: supplier.ultimateSupplier || '',
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        country: supplier.country || '',
        taxId: supplier.taxId || '',
        bankDetails: supplier.bankDetails || '',
        creditTermDays: supplier.creditTermDays || 30,
      })
    } else {
      form.reset({
        code: '',
        name: '',
        type: 'local',
        ultimateSupplier: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        country: '',
        taxId: '',
        bankDetails: '',
        creditTermDays: 30,
      })
    }
  }, [supplier, form])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const url = isEditing ? `/api/suppliers/${supplier.id}` : '/api/suppliers'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const result = await response.json()
      if (result.success) {
        toast.success(isEditing ? 'Supplier updated successfully' : 'Supplier created successfully')
        onSuccess()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error saving supplier:', error)
      toast.error('Failed to save supplier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEditing ? 'Update supplier details' : 'Add a new supplier to your directory'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Supplier Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., SUP001"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Supplier name"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="foreign">Foreign</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ultimateSupplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Ultimate Supplier (for tracking through Singapore office)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ultimate supplier name"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Contact Person</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Contact name"
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
                    <FormLabel className="text-slate-200">Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Phone number"
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
                        placeholder="email@example.com"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Country</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Country"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creditTermDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Credit Term (Days)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Full address"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  'Update Supplier'
                ) : (
                  'Create Supplier'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

