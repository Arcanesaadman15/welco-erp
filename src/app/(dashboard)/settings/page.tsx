'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Building2, MapPin, Users, Settings as SettingsIcon } from 'lucide-react'
import { toast } from 'sonner'

interface Location {
  id: string
  code: string
  name: string
  type: string
  address: string | null
  isActive: boolean
}

export default function SettingsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [newLocation, setNewLocation] = useState({ code: '', name: '', type: 'warehouse', address: '' })

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      const result = await response.json()
      if (result.success) {
        setLocations(result.data)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocation),
      })
      const result = await response.json()
      if (result.success) {
        toast.success('Location added successfully')
        setNewLocation({ code: '', name: '', type: 'warehouse', address: '' })
        fetchLocations()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error adding location:', error)
      toast.error('Failed to add location')
    }
  }

  const locationColumns: ColumnDef<Location>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-emerald-400">{row.original.code}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.type.toUpperCase()}</Badge>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => row.original.address || '-',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage system settings and configurations</p>
      </div>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="locations" className="data-[state=active]:bg-emerald-600">
            <MapPin className="mr-2 h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-emerald-600">
            <Building2 className="mr-2 h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-emerald-600">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-emerald-600">
            <SettingsIcon className="mr-2 h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Add New Location</CardTitle>
              <CardDescription className="text-slate-400">
                Add warehouses, sites, or offices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLocation} className="flex gap-4 flex-wrap">
                <div className="space-y-2">
                  <Label className="text-slate-200">Code</Label>
                  <Input
                    value={newLocation.code}
                    onChange={(e) => setNewLocation({ ...newLocation, code: e.target.value })}
                    placeholder="e.g., WH01"
                    className="w-32 bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Name</Label>
                  <Input
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    placeholder="Location name"
                    className="w-48 bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Type</Label>
                  <select
                    value={newLocation.type}
                    onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
                    className="h-9 w-36 rounded-md border border-slate-600 bg-slate-700/50 px-3 text-white"
                  >
                    <option value="warehouse">Warehouse</option>
                    <option value="site">Site</option>
                    <option value="office">Office</option>
                    <option value="store">Store</option>
                  </select>
                </div>
                <div className="space-y-2 flex-1">
                  <Label className="text-slate-200">Address</Label>
                  <Input
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                    placeholder="Full address"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Location
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
            </div>
          ) : (
            <DataTable
              columns={locationColumns}
              data={locations}
              searchKey="name"
              searchPlaceholder="Search locations..."
            />
          )}
        </TabsContent>

        <TabsContent value="company">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Company Information</CardTitle>
              <CardDescription className="text-slate-400">
                Basic company details for documents and reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Company Name</Label>
                  <Input
                    defaultValue="Welco Engineering Ltd."
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Trade License</Label>
                  <Input
                    placeholder="Trade license number"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Address</Label>
                <Input
                  placeholder="Company address"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Phone</Label>
                  <Input
                    placeholder="Phone number"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Email</Label>
                  <Input
                    type="email"
                    placeholder="Company email"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Website</Label>
                  <Input
                    placeholder="www.example.com"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription className="text-slate-400">
                Users are managed through Supabase Authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                To add or manage users, please use the Supabase Dashboard or create users 
                through the system&apos;s signup process. User roles and permissions can be 
                assigned after the user account is created.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">System Settings</CardTitle>
              <CardDescription className="text-slate-400">
                Global system configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Default Currency</Label>
                  <Input
                    defaultValue="BDT"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Fiscal Year Start</Label>
                  <Input
                    type="date"
                    defaultValue="2024-07-01"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Default VAT Rate (%)</Label>
                  <Input
                    type="number"
                    defaultValue="15"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Low Stock Threshold</Label>
                  <Input
                    type="number"
                    defaultValue="10"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

