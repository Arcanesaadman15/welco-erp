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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.number().min(0),
  creditTermDays: z.number().min(0),
})

type FormValues = z.infer<typeof formSchema>

interface Customer {
  id: string
  code: string
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  billingAddress: string | null
  shippingAddress?: string | null
  taxId?: string | null
  creditLimit: number
  creditTermDays?: number
}

interface CustomerFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  customer: Customer | null
}

export function CustomerFormDialog({ open, onClose, onSuccess, customer }: CustomerFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!customer

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      billingAddress: '',
      shippingAddress: '',
      taxId: '',
      creditLimit: 0,
      creditTermDays: 30,
    },
  })

  useEffect(() => {
    if (customer) {
      form.reset({
        code: customer.code,
        name: customer.name,
        contactPerson: customer.contactPerson || '',
        phone: customer.phone || '',
        email: customer.email || '',
        billingAddress: customer.billingAddress || '',
        shippingAddress: customer.shippingAddress || '',
        taxId: customer.taxId || '',
        creditLimit: Number(customer.creditLimit),
        creditTermDays: customer.creditTermDays || 30,
      })
    } else {
      form.reset({
        code: '',
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        billingAddress: '',
        shippingAddress: '',
        taxId: '',
        creditLimit: 0,
        creditTermDays: 30,
      })
    }
  }, [customer, form])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const url = isEditing ? `/api/customers/${customer.id}` : '/api/customers'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const result = await response.json()
      if (result.success) {
        toast.success(isEditing ? 'Customer updated successfully' : 'Customer created successfully')
        onSuccess()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      toast.error('Failed to save customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEditing ? 'Update customer details' : 'Add a new customer to your directory'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Customer Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., CUST001"
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
                        placeholder="Customer name"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <FormField
              control={form.control}
              name="billingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Billing Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Billing address"
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
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Tax ID / TIN</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Tax ID"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Credit Limit (৳)</FormLabel>
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
                  'Update Customer'
                ) : (
                  'Create Customer'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

