'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, PackageMinus, ScanLine } from 'lucide-react'
import { toast } from 'sonner'
import { BarcodeScanner } from '@/components/barcode-scanner'

const formSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  locationId: z.string().min(1, 'Location is required'),
  quantity: z.number().positive('Quantity must be positive'),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Item {
  id: string
  code: string
  name: string
  unitOfMeasure: string
}

interface Location {
  id: string
  name: string
  code: string
}

export default function IssueStockPage() {
  const [items, setItems] = useState<Item[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemId: '',
      locationId: '',
      quantity: 1,
      referenceType: 'manual',
      referenceId: '',
      remarks: '',
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, locationsRes] = await Promise.all([
          fetch('/api/items'),
          fetch('/api/locations'),
        ])
        const itemsData = await itemsRes.json()
        const locationsData = await locationsRes.json()

        if (itemsData.success) setItems(itemsData.data)
        if (locationsData.success) setLocations(locationsData.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const response = await fetch('/api/inventory/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Stock issued successfully')
        form.reset({
          itemId: '',
          locationId: values.locationId,
          quantity: 1,
          referenceType: 'manual',
          referenceId: '',
          remarks: '',
        })
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error issuing stock:', error)
      toast.error('Failed to issue stock')
    } finally {
      setLoading(false)
    }
  }

  const handleBarcodeScanned = (barcode: string) => {
    const item = items.find(
      (i) => i.code === barcode || i.code.toLowerCase() === barcode.toLowerCase()
    )
    if (item) {
      form.setValue('itemId', item.id)
      toast.success(`Item found: ${item.name}`)
    } else {
      toast.error('Item not found for barcode: ' + barcode)
    }
    setScannerOpen(false)
  }

  const selectedItem = items.find((i) => i.id === form.watch('itemId'))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Issue Stock</h1>
        <p className="text-slate-400">Remove items from inventory</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PackageMinus className="h-5 w-5 text-red-400" />
              Stock Issue Entry
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter details for outgoing stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="itemId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">Item</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.code} - {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setScannerOpen(true)}
                    className="mt-8 bg-slate-700 border-slate-600"
                  >
                    <ScanLine className="h-4 w-4" />
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.name}
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">
                        Quantity {selectedItem && `(${selectedItem.unitOfMeasure})`}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0.01"
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
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Reason for issue..."
                          className="bg-slate-700/50 border-slate-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Issue Stock'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <p>• Stock will be deducted from the selected location</p>
            <p>• System will prevent issuing more than available stock</p>
            <p>• Use remarks to document the purpose of the issue</p>
            <p>• For sales, use the Sales Order workflow instead</p>
          </CardContent>
        </Card>
      </div>

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />
    </div>
  )
}

