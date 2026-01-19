import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { DEFAULT_PERMISSIONS } from '../src/lib/permissions'
import { getBcryptCost, validatePasswordStrength } from '../src/lib/password-policy'

const prisma = new PrismaClient()

const shouldSeedUsers = process.env.SEED_USERS_ENABLE === 'true'
const adminEmail = process.env.SEED_ADMIN_EMAIL
const adminPassword = process.env.SEED_ADMIN_PASSWORD
const managerEmail = process.env.SEED_MANAGER_EMAIL
const managerPassword = process.env.SEED_MANAGER_PASSWORD
const userEmail = process.env.SEED_USER_EMAIL
const userPassword = process.env.SEED_USER_PASSWORD
const bcryptCost = getBcryptCost()

async function createUserIfAllowed({
  email,
  password,
  fullName,
  roleId,
}: {
  email?: string
  password?: string
  fullName: string
  roleId: string
}) {
  if (!email || !password) {
    console.log(`⚠️ Skipping ${fullName} creation: email/password not provided`)
    return
  }

  const strength = validatePasswordStrength(password)
  if (!strength.valid) {
    throw new Error(`Weak password for ${email}: ${strength.message}`)
  }

  const hashedPassword = await hash(password, bcryptCost)

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      fullName,
      roleId,
    },
  })

  console.log(`✅ User ensured: ${email}`)
}

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

  if (shouldSeedUsers) {
    console.log('ℹ️ User seeding enabled via SEED_USERS_ENABLE')

    await createUserIfAllowed({
      email: adminEmail,
      password: adminPassword,
      fullName: 'System Admin',
      roleId: adminRole.id,
    })

    await createUserIfAllowed({
      email: managerEmail,
      password: managerPassword,
      fullName: 'Test Manager',
      roleId: managerRole.id,
    })

    await createUserIfAllowed({
      email: userEmail,
      password: userPassword,
      fullName: 'Test User',
      roleId: userRole.id,
    })
  } else {
    console.log('ℹ️ User creation skipped (SEED_USERS_ENABLE not true)')
  }

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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
