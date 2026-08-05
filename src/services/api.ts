import axios, { AxiosInstance, AxiosError } from 'axios'
import { tokenManager } from '@/utils/tokenManager'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://www.api.digiayudh.com/' || 'https://digiayudhbackend.vercel.app/api'

/**
 * Always use the real backend API.
 * Mock API is disabled - all data must come from the backend.
 */
const USE_MOCK = false

export type UserRole = 'admin' | 'employee' | 'client'

export interface ClientSignupData {
  name: string
  companyName: string
  email: string
  countryCode: string
  phone: string
  password: string
  confirmPassword: string
  companyType: string
  city: string
  state: string
  country: string
  termsAccepted: boolean
  verificationToken?: string
}

export interface CreateEmployeeData {
  name: string
  email: string
  password?: string
  phone?: string
  countryCode?: string
  department?: string
  position?: string
  role?: UserRole
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      withCredentials: true,
    })

    this.client.interceptors.request.use((config) => {
      const token = tokenManager.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
      }

      return config
    })

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean }

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/login') &&
          !originalRequest.url?.includes('/auth/refresh') &&
          !originalRequest.url?.includes('/auth/signup')
        ) {
          originalRequest._retry = true
          try {
            const refreshToken = tokenManager.getRefreshToken()
            if (!refreshToken) throw new Error('No refresh token')

            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
            const { token, refreshToken: newRefreshToken } = response.data

            tokenManager.setToken(token)
            if (newRefreshToken) {
              tokenManager.setRefreshToken(newRefreshToken)
            }

            originalRequest.headers.Authorization = `Bearer ${token}`
            return this.client(originalRequest)
          } catch {
            window.dispatchEvent(new CustomEvent('auth:session-expired'))
          }
        }

        return Promise.reject(error)
      }
    )
  }

  getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string; errors?: { message: string }[] }
      if (data?.errors?.length) {
        return data.errors.map((e) => e.message).join('. ')
      }
      if (data?.message) return data.message
      if (error.response?.status === 403) return 'You do not have permission to perform this action'
      if (error.response?.status === 404) return 'Resource not found'
      if (error.response?.status === 500) return 'Server error. Please try again later'
      if (!error.response) return 'Network error. Please check your connection'
    }
    if (error instanceof Error) return error.message
    return 'An unexpected error occurred'
  }

  sendEmailOtp(email: string) {
    return this.client.post("/auth/send-email-otp", { email })
  }

  verifyEmailOtp(email: string, otp: string) {
    return this.client.post("/auth/verify-email-otp", { email, otp })
  }

  resendEmailOtp(email: string) {
    return this.client.post("/auth/resend-email-otp", { email })
  }

  // Auth
  login(email: string, password: string, expectedRole?: UserRole) {
    return this.client.post('/auth/login', { email, password, expectedRole })
  }

  clientSignup(data: ClientSignupData) {
    return this.client.post('/auth/signup', data)
  }

  getMe() {
    return this.client.get('/auth')
  }

  logout() {
    return this.client.post('/auth/logout')
  }

  sendOtp(phone: string, countryCode: string) {
    return this.client.post('/auth/send-otp', { phone, countryCode })
  }

  verifyOtp(phone: string, otp: string) {
    return this.client.post('/auth/verify-otp', { phone, otp })
  }

  refresh(refreshToken: string) {
    return this.client.post('/auth/refresh', { refreshToken })
  }

  requestPasswordReset(email: string) {
    return this.client.post('/auth/forgot-password', { email })
  }

  verifyPasswordResetToken(token: string) {
    return this.client.post('/auth/verify-reset-token', { token })
  }

  resetPassword(token: string, password: string) {
    return this.client.post('/auth/reset-password', { token, password })
  }

  // Admin employee management
  getEmployeeAccounts() {
    return this.client.get('/users/employees')
  }
  createEmployeeAccount(data: CreateEmployeeData) {
    return this.client.post('/users/employees', data)
  }
  updateEmployeeAccount(id: string, data: Record<string, unknown>) {
    return this.client.put(`/users/employees/${id}`, data)
  }
  resetEmployeePassword(id: string, newPassword: string) {
    return this.client.post(`/users/employees/${id}/reset-password`, { newPassword })
  }
  deleteEmployeeAccount(id: string) {
    return this.client.delete(`/users/employees/${id}`)
  }
  assignClientToEmployee(clientId: string, employeeId: string) {
    return this.client.post('/users/assign-client', { clientId, employeeId })
  }

  // Clients & verification
  getClients(company?: string) {
    const fallbackCompany = company || 'digiayudh'
    return this.client.get('/users/clients').catch(async () => {
      return this.client.get(`/users?company=${encodeURIComponent(fallbackCompany)}`)
    })
  }
  verifyClient(clientId: string) {
    return this.client.post(`/users/clients/${clientId}/verify`)
  }
  rejectClient(clientId: string, reason: string) {
    return this.client.post(`/users/clients/${clientId}/reject`, { reason })
  }

  // Users
  getUsers(company: string) {
    return this.client.get(`/users?company=${company}`)
  }
  getUserById(id: string) {
    return this.client.get(`/users/${id}`)
  }
  updateUser(id: string, data: Record<string, unknown>) {
    return this.client.put(`/users/${id}`, data)
  }
  updateProfile(data: Record<string, unknown>) {
    return this.client.put('/profile/update', data)
  }

  // Projects
  getProjects(company: string) {
  return this.client.get(`/projects?company=${company}`)
}
createProject(data: Record<string, unknown>) {
  return this.client.post('/projects/create-project', data)
}
getProjectById(id: string) {
  return this.client.get(`/projects/${id}`)
}
updateProject(id: string, data: Record<string, unknown>) {
  return this.client.put(`/projects/${id}`, data)
}
deleteProject(id: string) {
  return this.client.delete(`/projects/${id}`)
}

  // Tasks
  getTasks(company: string, projectId?: string) {
    const url = projectId
      ? `/tasks?company=${company}&projectId=${projectId}`
      : `/tasks?company=${company}`
    return this.client.get(url)
  }
  createTask(data: Record<string, unknown>) {
    return this.client.post('/tasks', data)
  }
  getTaskById(id: string) {
    return this.client.get(`/tasks/${id}`)
  }
  updateTask(id: string, data: Record<string, unknown>) {
    return this.client.put(`/tasks/${id}`, data)
  }
  deleteTask(id: string) {
    return this.client.delete(`/tasks/${id}`)
  }

  // Employees (HR records)
  getEmployees(company?: string) {
    const fallbackCompany = company || 'digiayudh'
    return this.client.get(`/employees?company=${encodeURIComponent(fallbackCompany)}`)
  }
  createEmployee(data: Record<string, unknown>) {
    return this.client.post('/employees', data)
  }
  getEmployeeById(id: string) {
    return this.client.get(`/employees/${id}`)
  }
  updateEmployee(id: string, data: Record<string, unknown>) {
    return this.client.put(`/employees/${id}`, data)
  }
  deleteEmployee(id: string) {
    return this.client.delete(`/employees/${id}`)
  }

  // Leads
  getLeads(company: string) {
    return this.client.get(`/leads?company_id=${company}`)
  }
  createLead(data: Record<string, unknown>) {
    return this.client.post('/leads', data)
  }
  getLeadById(id: string) {
    return this.client.get(`/leads/${id}`)
  }
  updateLead(id: string, data: Record<string, unknown>) {
    return this.client.put(`/leads/${id}`, data)
  }
  deleteLead(id: string) {
    return this.client.delete(`/leads/${id}`)
  }

  // Messages & chats
  getMessages(chatId: string) {
    return this.client.get(`/messages/${chatId}`)
  }
  sendMessage(chatId: string, content: string) {
    return this.client.post(`/messages/${chatId}`, { content })
  }
  getChats(company: string, userId: string) {
    return this.client.get(`/chats?company=${company}&userId=${userId}`)
  }
  createChat(data: Record<string, unknown>) {
    return this.client.post('/chats', data)
  }

  // Notifications
  getNotifications(userId: string) {
    return this.client.get(`/notifications/${userId}`)
  }
  markNotificationAsRead(id: string) {
    return this.client.put(`/notifications/${id}/read`)
  }
  markAllNotificationsRead(userId: string) {
    return this.client.put(`/notifications/read-all`, { userId })
  }

  // Contact requests
  createContactRequest(data: Record<string, unknown>) {
    return this.client.post('/contact', data)
  }
  getContactRequests() {
    return this.client.get('/contact')
  }
  updateContactRequest(id: string, data: Record<string, unknown>) {
    return this.client.put(`/contact/${id}`, data)
  }

  // Invoices
  getInvoices(clientId?: string) {
    return this.client.get(clientId ? `/invoices?clientId=${clientId}` : '/invoices')
  }
  updateInvoice(id: string, data: Record<string, unknown>) {
    return this.client.put(`/invoices/${id}`, data)
  }

  // Meetings
  getMeetings(clientId?: string) {
    return this.client.get(clientId ? `/meetings?clientId=${clientId}` : '/meetings')
  }
  createMeeting(data: Record<string, unknown>) {
    return this.client.post('/meetings', data)
  }
  updateMeeting(id: string, data: Record<string, unknown>) {
    return this.client.put(`/meetings/${id}`, data)
  }
  deleteMeeting(id: string) {
    return this.client.delete(`/meetings/${id}`)
  }

  // Documents
  getDocuments(ownerId?: string, projectId?: string) {
    const params = new URLSearchParams()
    if (ownerId) params.append('ownerId', ownerId)
    if (projectId) params.append('projectId', projectId)
    return this.client.get(`/documents?${params.toString()}`)
  }
  uploadDocument(formData: FormData) {
    return this.client.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
  downloadDocument(id: string) {
    return this.client.get(`/documents/${id}/download`, { responseType: 'blob' })
  }
  viewDocument(id: string) {
    return this.client.get(`/documents/${id}`, { responseType: 'blob' })
  }
  deleteDocument(id: string) {
    return this.client.delete(`/documents/${id}`)
  }

  // Support tickets
  getSupportTickets(createdBy?: string) {
    return this.client.get(createdBy ? `/support?createdBy=${createdBy}` : '/support')
  }
  createSupportTicket(data: Record<string, unknown>) {
    return this.client.post('/support', data)
  }
  replySupportTicket(id: string, message: string) {
    return this.client.post(`/support/${id}/reply`, { message })
  }
  updateSupportTicket(id: string, data: Record<string, unknown>) {
    return this.client.put(`/support/${id}`, data)
  }

// Audit logs
  getAuditLogs() {
    return this.client.get('/audit-logs')
  }

  // Sport Tickets
  getSportTickets(clientId?: string) {
    return this.client.get(clientId ? `/sport-tickets?clientId=${clientId}` : '/sport-tickets')
  }
  getSportTicketById(id: string) {
    return this.client.get(`/sport-tickets/${id}`)
  }
  createSportTicket(data: Record<string, unknown>) {
    return this.client.post('/sport-tickets', data)
  }
  replySportTicket(id: string, message: string, screenshots?: string[]) {
    return this.client.post(`/sport-tickets/${id}/reply`, { message, screenshots })
  }
  updateSportTicket(id: string, data: Record<string, unknown>) {
    return this.client.put(`/sport-tickets/${id}`, data)
  }
  deleteSportTicket(id: string) {
    return this.client.delete(`/sport-tickets/${id}`)
  }

  // Sport Tokens
  getSportTokens(clientId?: string) {
    return this.client.get(clientId ? `/sport-tokens?clientId=${clientId}` : '/sport-tokens')
  }
  updateSportToken(id: string, data: Record<string, unknown>) {
    return this.client.put(`/sport-tokens/${id}`, data)
  }
  createSportToken(data: Record<string, unknown>) {
    return this.client.post('/sport-tokens', data)
  }

  // Attendance
  getAttendance(company: string, date?: string) {
    const params = new URLSearchParams()
    if (company) params.append('company', company)
    if (date) params.append('date', date)
    return this.client.get(`/attendance?${params.toString()}`)
  }
  markAttendance(data: Record<string, unknown>) {
    return this.client.post('/attendance', data)
  }

  // Leave Requests
  getLeaveRequests(company: string) {
    return this.client.get(`/leaves?company=${company}`)
  }
  createLeaveRequest(data: Record<string, unknown>) {
    return this.client.post('/leaves', data)
  }
  approveLeaveRequest(id: string, approvedBy: string) {
    return this.client.put(`/leaves/${id}/approve`, { approvedBy })
  }
  rejectLeaveRequest(id: string, reason: string) {
    return this.client.put(`/leaves/${id}/reject`, { rejectionReason: reason })
  }

  // Dashboard
  getDashboardStats(role: string) {
    return this.client.get(`/dashboard/stats?role=${role}`)
  }

  // To-Do Lists
  getToDos(employeeId: string) {
    return this.client.get(`/todos?employeeId=${employeeId}`)
  }
  createToDo(data: Record<string, unknown>) {
    return this.client.post('/todos', data)
  }
  updateToDo(id: string, data: Record<string, unknown>) {
    return this.client.put(`/todos/${id}`, data)
  }
  deleteToDo(id: string) {
    return this.client.delete(`/todos/${id}`)
  }

  // Certificates
  getCertificates() {
    return this.client.get('/certificates')
  }
  getCertificatesByEmployee(employeeId: string) {
    return this.client.get(`/certificates?employeeId=${employeeId}`)
  }
  issueCertificate(data: Record<string, unknown>) {
    return this.client.post('/certificates', data)
  }
  verifyCertificate(token: string) {
    return this.client.get(`/certificates/verify/${token}`)
  }
  deleteCertificate(id: string) {
    return this.client.delete(`/certificates/${id}`)
  }

  // File uploads
  uploadProfilePicture(file: File) {
    const formData = new FormData()
    formData.append('photo', file)
    return this.client.post('/profile/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
  deleteProfilePicture() {
    return this.client.delete('/profile/remove-photo')
  }
  
  // Reports
  getReports(company: string) {
    return this.client.get(`/reports?company=${company}`)
  }
  createReport(data: Record<string, unknown>) {
    return this.client.post('/reports', data)
  }
  exportReport(reportId: string) {
    return this.client.get(`/reports/${reportId}/export`, { responseType: 'blob' })
  }
}

export default new ApiClient()
