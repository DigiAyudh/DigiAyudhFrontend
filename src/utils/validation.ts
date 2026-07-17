export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character'
  return null
}

export const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return 'Mobile number is required'
  if (!/^[0-9]{6,15}$/.test(phone)) return 'Mobile number must be 6-15 digits'
  return null
}

export const getDashboardPath = (role: 'admin' | 'employee' | 'client'): string => {
  const paths = {
    admin: '/admin/dashboard',
    employee: '/employee/dashboard',
    client: '/client/dashboard',
  }
  return paths[role]
}

export const COUNTRY_CODES = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'Singapore' },
  { code: '+81', country: 'Japan' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+86', country: 'China' },
]

export const COMPANY_TYPES = [
  'Startup',
  'SME',
  'Enterprise',
  'Agency',
  'Freelancer',
  'Non-Profit',
  'Government',
  'Other',
]
