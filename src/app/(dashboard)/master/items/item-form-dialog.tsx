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
  description: z.string().optional(),
  categoryId: z.string().optional(),
  unitOfMeasure: z.string().min(1, 'Unit is required'),
  hsCode: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  minStockLevel: z.number().min(0),
  reorderPoint: z.number().min(0),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  taxRate: z.number().min(0).max(100),
})

type FormValues = z.infer<typeof formSchema>

interface Item {
  id: string
  code: string
  name: string
  description: string | null
  unitOfMeasure: string
  hsCode: string | null
  countryOfOrigin: string | null
  minStockLevel: number
  reorderPoint?: number
  costPrice: number
  sellingPrice: number
  taxRate?: number
  category: { id: string; name: string } | null
}

interface ItemFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  item: Item | null
}

const unitOptions = [
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'ltr', label: 'Liters (ltr)' },
  { value: 'mtr', label: 'Meters (mtr)' },
  { value: 'box', label: 'Box' },
  { value: 'set', label: 'Set' },
  { value: 'roll', label: 'Roll' },
]

export function ItemFormDialog({ open, onClose, onSuccess, item }: ItemFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!item

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      categoryId: '',
      unitOfMeasure: 'pcs',
      hsCode: '',
      countryOfOrigin: '',
      minStockLevel: 0,
      reorderPoint: 0,
      costPrice: 0,
      sellingPrice: 0,
      taxRate: 0,
    },
  })

  useEffect(() => {
    if (item) {
      form.reset({
        code: item.code,
        name: item.name,
        description: item.description || '',
        categoryId: item.category?.id || '',
        unitOfMeasure: item.unitOfMeasure,
        hsCode: item.hsCode || '',
        countryOfOrigin: item.countryOfOrigin || '',
        minStockLevel: Number(item.minStockLevel),
        reorderPoint: Number(item.reorderPoint) || 0,
        costPrice: Number(item.costPrice),
        sellingPrice: Number(item.sellingPrice),
        taxRate: Number(item.taxRate) || 0,
      })
    } else {
      form.reset({
        code: '',
        name: '',
        description: '',
        categoryId: '',
        unitOfMeasure: 'pcs',
        hsCode: '',
        countryOfOrigin: '',
        minStockLevel: 0,
        reorderPoint: 0,
        costPrice: 0,
        sellingPrice: 0,
        taxRate: 0,
      })
    }
  }, [item, form])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const url = isEditing ? `/api/items/${item.id}` : '/api/items'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const result = await response.json()
      if (result.success) {
        toast.success(isEditing ? 'Item updated successfully' : 'Item created successfully')
        onSuccess()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEditing ? 'Update item details' : 'Add a new item to your inventory'}
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
                    <FormLabel className="text-slate-200">Item Code (SKU)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., ITM001"
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
                        placeholder="Item name"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Item description"
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
                name="unitOfMeasure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Unit of Measure</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="hsCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">HS Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="HS Code"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countryOfOrigin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Country of Origin</FormLabel>
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
            </div>

            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Cost Price (৳)</FormLabel>
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
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Selling Price (৳)</FormLabel>
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
                name="minStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Min Stock Level</FormLabel>
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
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Tax Rate (%)</FormLabel>
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
                  'Update Item'
                ) : (
                  'Create Item'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

