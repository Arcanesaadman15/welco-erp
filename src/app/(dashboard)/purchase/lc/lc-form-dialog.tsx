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
  lcNumber: z.string().min(1, 'LC number is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  bankBranch: z.string().optional(),
  openingDate: z.string().min(1, 'Opening date is required'),
  shipmentDate: z.string().optional(),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  totalValue: z.number().positive('Value must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  exchangeRate: z.number().positive(),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Supplier {
  id: string
  code: string
  name: string
  type: string
}

interface LCFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function LCFormDialog({ open, onClose, onSuccess }: LCFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lcNumber: '',
      supplierId: '',
      bankName: '',
      bankBranch: '',
      openingDate: '',
      shipmentDate: '',
      expiryDate: '',
      totalValue: 0,
      currency: 'USD',
      exchangeRate: 1,
      remarks: '',
    },
  })

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('/api/suppliers?type=foreign')
        const result = await response.json()
        if (result.success) {
          setSuppliers(result.data.filter((s: Supplier) => s.type === 'foreign'))
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error)
      }
    }
    if (open) fetchSuppliers()
  }, [open])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const response = await fetch('/api/purchase/lc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const result = await response.json()
      if (result.success) {
        toast.success('LC created successfully')
        form.reset()
        onSuccess()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error creating LC:', error)
      toast.error('Failed to create LC')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>New Letter of Credit</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a new LC for foreign purchases
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lcNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">LC Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., LC-2024-001"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Supplier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Bank Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Bank name"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankBranch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Branch</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Branch name"
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
                name="openingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Opening Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Shipment Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
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
                name="totalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Total Value</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="SGD">SGD</SelectItem>
                        <SelectItem value="CNY">CNY</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exchangeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Exchange Rate (to BDT)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.0001"
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
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional notes..."
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
                    Creating...
                  </>
                ) : (
                  'Create LC'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

