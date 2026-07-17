// Mock authentication service - simulates backend auth without needing a server

interface MockUser {
  _id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'employee' | 'client'
  company: string
  avatar?: string
}

const MOCK_USERS: MockUser[] = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@digiayudh.com',
    password: 'password123',
    role: 'admin',
    company: 'DigiAyudh Inc',
  },
  {
    _id: '2',
    name: 'John Employee',
    email: 'emp@digiayudh.com',
    password: 'password123',
    role: 'employee',
    company: 'DigiAyudh Inc',
  },
  {
    _id: '3',
    name: 'Client User',
    email: 'client@digiayudh.com',
    password: 'password123',
    role: 'client',
    company: 'Client Corp',
  },
]

export async function mockLogin(email: string, password: string) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find((u) => u.email === email && u.password === password)
      if (user) {
        const token = `token_${user._id}_${Date.now()}`
        const refreshToken = `refresh_${user._id}_${Date.now()}`
        resolve({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: user.company,
          },
          token,
          refreshToken,
        })
      } else {
        reject({ response: { data: { message: 'Invalid email or password' } } })
      }
    }, 500)
  })
}

export async function mockSignup(data: {
  name: string
  email: string
  password: string
  role: string
  companyName?: string
}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const existingUser = MOCK_USERS.find((u) => u.email === data.email)
      if (existingUser) {
        reject({ response: { data: { message: 'Email already exists' } } })
      } else {
        const newUser: MockUser = {
          _id: String(MOCK_USERS.length + 1),
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role as any,
          company: data.companyName || 'Company',
        }
        MOCK_USERS.push(newUser)
        const token = `token_${newUser._id}_${Date.now()}`
        const refreshToken = `refresh_${newUser._id}_${Date.now()}`
        resolve({
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            company: newUser.company,
          },
          token,
          refreshToken,
        })
      }
    }, 500)
  })
}
