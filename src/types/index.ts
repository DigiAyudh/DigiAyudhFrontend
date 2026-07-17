export type UserRole = 'admin' | 'employee' | 'client'
export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  profileImage?: string
  department?: string
  position?: string
  joinDate: Date
  isActive: boolean
  company?: string
  companyName?: string
  city?: string
  state?: string
  country?: string
  /** Clients require admin verification before full access */
  verificationStatus?: VerificationStatus
  rejectionReason?: string
  assignedEmployeeId?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface ContactRequest {
  _id: string
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  status: 'new' | 'in-review' | 'responded' | 'closed'
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  _id: string
  number: string
  clientId: string
  clientName: string
  projectId?: string
  amount: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  issueDate: Date
  dueDate: Date
  items: { description: string; quantity: number; rate: number }[]
  createdAt: Date
}

export interface Meeting {
  _id: string
  title: string
  description?: string
  start: Date
  end: Date
  attendees: string[]
  organizerId: string
  clientId?: string
  location?: string
  link?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: Date
}

export interface DocumentFile {
  _id: string
  name: string
  type: string
  size: number
  category: 'contract' | 'invoice' | 'report' | 'asset' | 'other'
  ownerId: string
  projectId?: string
  url: string
  createdAt: Date
}

export interface SupportTicket {
  _id: string
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  category: string
  createdBy: string
  createdByName: string
  assignedTo?: string
  replies: { authorId: string; authorName: string; message: string; createdAt: Date }[]
  createdAt: Date
  updatedAt: Date
}

export interface AuditLog {
  _id: string
  actorId: string
  actorName: string
  action: string
  entity: string
  entityId?: string
  details?: string
  ipAddress?: string
  createdAt: Date
}

export interface Attendance {
  _id: string
  employeeId: string
  employeeName: string
  date: Date
  checkIn?: string
  checkOut?: string
  status: 'present' | 'absent' | 'late' | 'leave' | 'remote'
  hours?: number
}

export interface DashboardStat {
  label: string
  value: number
  change: number
  trend: 'up' | 'down'
  format?: 'number' | 'currency' | 'percent'
}

export interface Company {
  _id: string
  name: string
  email: string
  phone: string
  industry: string
  size: string
  website?: string
  logo?: string
  address: string
  city: string
  country: string
  postalCode: string
  subscription: 'free' | 'pro' | 'enterprise'
  subscriptionEndDate?: Date
  adminId: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  _id: string
  title: string
  description: string
  status: 'planning' | 'active' | 'completed' | 'on-hold'
  startDate: Date
  endDate?: Date
  budget?: number
  budget_used?: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  clientId: string
  managerId: string
  teamMembers: string[]
  company: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  _id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high'
  projectId: string
  assignedTo: string
  createdBy: string
  dueDate: Date
  estimatedHours?: number
  actualHours?: number
  attachments?: string[]
  company: string
  createdAt: Date
  updatedAt: Date
}

export interface Employee {
  _id: string
  userId: string
  name: string
  email: string
  position: string
  department: string
  salary?: number
  joiningDate: Date
  phone: string
  address: string
  city: string
  country: string
  emergencyContact?: string
  emergencyPhone?: string
  isActive: boolean
  company: string
  createdAt: Date
  updatedAt: Date
}

export interface Lead {
  _id: string
  name: string
  email: string
  phone: string
  company: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed'
  budget?: number
  notes?: string
  assignedTo?: string
  company_id: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  _id: string
  senderId: string
  senderName: string
  senderProfileImage?: string
  content: string
  chatId: string
  isRead: boolean
  createdAt: Date
}

export interface Chat {
  _id: string
  participants: string[]
  participantNames: string[]
  lastMessage?: string
  lastMessageTime?: Date
  isGroup: boolean
  groupName?: string
  groupImage?: string
  company: string
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  link?: string
  createdAt: Date
}

export interface Report {
  _id: string
  title: string
  type: 'projects' | 'employees' | 'tasks' | 'finances' | 'leads'
  filters: Record<string, any>
  createdBy: string
  company: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  refreshToken?: string
  user?: User
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface ApiError extends Error {
  message: string
  status?: number
  code?: string
}

export interface LoginCredentials {
  email: string
  password: string
}
