const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

const ADMIN_PERMISSIONS = [
  { module: 'dashboard', action: 'read' },
  { module: 'master_data', action: 'read' },
  { module: 'master_data', action: 'write' },
  { module: 'master_data', action: 'delete' },
  { module: 'inventory', action: 'read' },
  { module: 'inventory', action: 'write' },
  { module: 'inventory', action: 'delete' },
  { module: 'inventory', action: 'approve' },
  { module: 'purchase', action: 'read' },
  { module: 'purchase', action: 'write' },
  { module: 'purchase', action: 'delete' },
  { module: 'purchase', action: 'approve' },
  { module: 'sales', action: 'read' },
  { module: 'sales', action: 'write' },
  { module: 'sales', action: 'delete' },
  { module: 'sales', action: 'approve' },
  { module: 'accounts', action: 'read' },
  { module: 'accounts', action: 'write' },
  { module: 'accounts', action: 'delete' },
  { module: 'accounts', action: 'approve' },
  { module: 'reports', action: 'read' },
  { module: 'settings', action: 'read' },
  { module: 'settings', action: 'write' },
  { module: 'admin', action: 'read' },
  { module: 'admin', action: 'write' },
  { module: 'admin', action: 'delete' },
]

function getEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function validatePasswordStrength(password) {
  const minLength = 8
  if (!password || password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters` }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include an uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include a lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include a number' }
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must include a symbol' }
  }
  const banned = new Set(['admin123', 'manager123', 'user123', 'password', '123456', 'welcome', 'welco2026'])
  if (banned.has(password.toLowerCase())) {
    return { valid: false, message: 'Password is too common' }
  }
  return { valid: true }
}

function getBcryptCost() {
  const parsed = Number(process.env.BCRYPT_COST || 12)
  if (Number.isNaN(parsed)) return 12
  return Math.min(Math.max(parsed, 10), 14)
}

async function ensureAdminRole() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'System Administrator with full access',
    },
  })

  for (const perm of ADMIN_PERMISSIONS) {
    await prisma.permission.upsert({
      where: {
        roleId_module_action: {
          roleId: adminRole.id,
          module: perm.module,
          action: perm.action,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        module: perm.module,
        action: perm.action,
      },
    })
  }

  return adminRole
}

async function main() {
  const token = getEnv('ADMIN_BOOTSTRAP_TOKEN')
  const confirm = getEnv('ADMIN_BOOTSTRAP_CONFIRM')
  if (token !== confirm) {
    throw new Error('ADMIN_BOOTSTRAP_CONFIRM must match ADMIN_BOOTSTRAP_TOKEN')
  }

  const email = getEnv('ADMIN_BOOTSTRAP_EMAIL').trim().toLowerCase()
  const password = getEnv('ADMIN_BOOTSTRAP_PASSWORD')
  const fullName = process.env.ADMIN_BOOTSTRAP_NAME || 'System Admin'
  const allowReset = process.env.ADMIN_BOOTSTRAP_ALLOW_RESET === 'true'
  const force = process.env.ADMIN_BOOTSTRAP_FORCE === 'true'

  const strength = validatePasswordStrength(password)
  if (!strength.valid) {
    throw new Error(`Weak password for ${email}: ${strength.message}`)
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: { name: 'Admin' } },
    select: { id: true, email: true },
  })

  if (existingAdmin && !allowReset) {
    console.log('ℹ️ Admin already exists. Set ADMIN_BOOTSTRAP_ALLOW_RESET=true to update.')
    return
  }

  if (existingAdmin && existingAdmin.email !== email && !force) {
    console.log('ℹ️ A different admin already exists. Set ADMIN_BOOTSTRAP_FORCE=true to create another.')
    return
  }

  const adminRole = await ensureAdminRole()
  const hashedPassword = await hash(password, getBcryptCost())

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        fullName,
        roleId: adminRole.id,
        status: 'active',
      },
    })
    console.log(`✅ Admin updated: ${email}`)
    return
  }

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      roleId: adminRole.id,
      status: 'active',
    },
  })

  console.log(`✅ Admin created: ${email}`)
}

main()
  .catch((error) => {
    console.error('Admin bootstrap failed:', error.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
