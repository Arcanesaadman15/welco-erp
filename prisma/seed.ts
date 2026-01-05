import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { DEFAULT_PERMISSIONS } from '../src/lib/permissions'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'System Administrator with full access',
    },
  })

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      description: 'Department Manager with approval rights',
    },
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'Regular user with limited access',
    },
  })

  console.log('✅ Roles created')

  // Create permissions for each role
  const roles = [
    { role: adminRole, name: 'Admin' },
    { role: managerRole, name: 'Manager' },
    { role: userRole, name: 'User' },
  ]

  for (const { role, name } of roles) {
    const permissions = DEFAULT_PERMISSIONS[name] || []
    
    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: {
          roleId_module_action: {
            roleId: role.id,
            module: perm.module,
            action: perm.action,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          module: perm.module,
          action: perm.action,
        },
      })
    }
  }

  console.log('✅ Permissions created')

  // Create departments
  await prisma.department.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: { name: 'Administration', code: 'ADMIN' },
  })

  await prisma.department.upsert({
    where: { code: 'PURCHASE' },
    update: {},
    create: { name: 'Procurement', code: 'PURCHASE' },
  })

  await prisma.department.upsert({
    where: { code: 'SALES' },
    update: {},
    create: { name: 'Sales', code: 'SALES' },
  })

  await prisma.department.upsert({
    where: { code: 'ACCOUNTS' },
    update: {},
    create: { name: 'Accounts', code: 'ACCOUNTS' },
  })

  await prisma.department.upsert({
    where: { code: 'INVENTORY' },
    update: {},
    create: { name: 'Inventory', code: 'INVENTORY' },
  })

  console.log('✅ Departments created')

  // Create locations
  await prisma.location.upsert({
    where: { code: 'WH-MAIN' },
    update: {},
    create: {
      name: 'Main Warehouse',
      code: 'WH-MAIN',
      address: 'Head Office',
      type: 'warehouse',
    },
  })

  await prisma.location.upsert({
    where: { code: 'SITE-01' },
    update: {},
    create: {
      name: 'Project Site 1',
      code: 'SITE-01',
      address: 'Project Location',
      type: 'site',
    },
  })

  console.log('✅ Locations created')

  // Create default admin user
  const hashedPassword = await hash('admin123', 12)
  
  await prisma.user.upsert({
    where: { email: 'admin@welco.com' },
    update: {},
    create: {
      email: 'admin@welco.com',
      password: hashedPassword,
      fullName: 'System Admin',
      roleId: adminRole.id,
    },
  })

  // Create a manager user for testing
  const managerPassword = await hash('manager123', 12)
  await prisma.user.upsert({
    where: { email: 'manager@welco.com' },
    update: {},
    create: {
      email: 'manager@welco.com',
      password: managerPassword,
      fullName: 'Test Manager',
      roleId: managerRole.id,
    },
  })

  // Create a regular user for testing
  const userPassword = await hash('user123', 12)
  await prisma.user.upsert({
    where: { email: 'user@welco.com' },
    update: {},
    create: {
      email: 'user@welco.com',
      password: userPassword,
      fullName: 'Test User',
      roleId: userRole.id,
    },
  })

  console.log('✅ Test users created')

  // Create some sample chart of accounts
  const assets = await prisma.chartOfAccounts.upsert({
    where: { code: '1000' },
    update: {},
    create: {
      code: '1000',
      name: 'Assets',
      accountType: 'Asset',
      description: 'All asset accounts',
    },
  })

  await prisma.chartOfAccounts.upsert({
    where: { code: '1100' },
    update: {},
    create: {
      code: '1100',
      name: 'Cash & Bank',
      accountType: 'Asset',
      parentId: assets.id,
    },
  })

  await prisma.chartOfAccounts.upsert({
    where: { code: '1200' },
    update: {},
    create: {
      code: '1200',
      name: 'Accounts Receivable',
      accountType: 'Asset',
      parentId: assets.id,
    },
  })

  await prisma.chartOfAccounts.upsert({
    where: { code: '1300' },
    update: {},
    create: {
      code: '1300',
      name: 'Inventory',
      accountType: 'Asset',
      parentId: assets.id,
    },
  })

  const liabilities = await prisma.chartOfAccounts.upsert({
    where: { code: '2000' },
    update: {},
    create: {
      code: '2000',
      name: 'Liabilities',
      accountType: 'Liability',
      description: 'All liability accounts',
    },
  })

  await prisma.chartOfAccounts.upsert({
    where: { code: '2100' },
    update: {},
    create: {
      code: '2100',
      name: 'Accounts Payable',
      accountType: 'Liability',
      parentId: liabilities.id,
    },
  })

  const revenue = await prisma.chartOfAccounts.upsert({
    where: { code: '4000' },
    update: {},
    create: {
      code: '4000',
      name: 'Revenue',
      accountType: 'Revenue',
      description: 'All revenue accounts',
    },
  })

  await prisma.chartOfAccounts.upsert({
    where: { code: '4100' },
    update: {},
    create: {
      code: '4100',
      name: 'Sales Revenue',
      accountType: 'Revenue',
      parentId: revenue.id,
    },
  })

  const expenses = await prisma.chartOfAccounts.upsert({
    where: { code: '5000' },
    update: {},
    create: {
      code: '5000',
      name: 'Expenses',
      accountType: 'Expense',
      description: 'All expense accounts',
    },
  })

  await prisma.chartOfAccounts.upsert({
    where: { code: '5100' },
    update: {},
    create: {
      code: '5100',
      name: 'Cost of Goods Sold',
      accountType: 'Expense',
      parentId: expenses.id,
    },
  })

  console.log('✅ Chart of Accounts created')

  console.log('')
  console.log('🎉 Database seeding completed!')
  console.log('')
  console.log('📋 Test User Credentials:')
  console.log('   Admin:   admin@welco.com / admin123')
  console.log('   Manager: manager@welco.com / manager123')
  console.log('   User:    user@welco.com / user123')
  console.log('')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
