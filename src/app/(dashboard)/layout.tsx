import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import prisma from '@/lib/prisma'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Get user details with permissions from local database
  let dbUser = null
  let permissions: { module: string; action: string }[] = []
  
  try {
    if (session.user?.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { 
          role: {
            include: {
              permissions: {
                select: {
                  module: true,
                  action: true,
                },
              },
            },
          },
        },
      })
      
      permissions = dbUser?.role?.permissions || []
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-900">
        <AppSidebar user={{
          name: dbUser?.fullName || session.user.name || 'User',
          email: session.user.email || '',
          role: dbUser?.role?.name || session.user.role || 'User',
          permissions: permissions,
        }} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
