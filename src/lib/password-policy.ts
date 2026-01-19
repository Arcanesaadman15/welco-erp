const DEFAULT_MIN_LENGTH = 8
const BANNED_PASSWORDS = new Set([
  'admin123',
  'manager123',
  'user123',
  'password',
  '123456',
  'welcome',
  'welco2026',
])

export interface PasswordPolicyResult {
  valid: boolean
  message?: string
}

export const PASSWORD_POLICY = {
  minLength: DEFAULT_MIN_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
}

export function validatePasswordStrength(password: string): PasswordPolicyResult {
  if (!password || password.length < PASSWORD_POLICY.minLength) {
    return {
      valid: false,
      message: `Password must be at least ${PASSWORD_POLICY.minLength} characters`,
    }
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include an uppercase letter' }
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include a lowercase letter' }
  }

  if (PASSWORD_POLICY.requireNumber && !/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include a number' }
  }

  if (PASSWORD_POLICY.requireSymbol && !/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must include a symbol' }
  }

  if (BANNED_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, message: 'Password is too common' }
  }

  return { valid: true }
}

export function getBcryptCost(): number {
  const parsed = Number(process.env.BCRYPT_COST || 12)
  if (Number.isNaN(parsed)) {
    return 12
  }
  return Math.min(Math.max(parsed, 10), 14)
}
