import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect('/login')
  }

  // Check if user has admin permissions
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  })

  const hasAdminAccess = user?.role?.permissions?.some(
    (p) => p.module === 'admin' && p.action === 'read'
  )

  if (!hasAdminAccess) {
    redirect('/dashboard?error=unauthorized')
  }

  return <>{children}</>
}

