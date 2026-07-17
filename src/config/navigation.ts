import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Users,
  UserCog,
  UserCheck,
  FolderKanban,
  ListChecks,
  CalendarDays,
  MessageSquare,
  FileText,
  Receipt,
  LifeBuoy,
  BarChart3,
  ShieldCheck,
  ClipboardList,
  Inbox,
  Clock,
  Settings,
  User,
  Bell,
  KanbanSquare,
  Calendar,
  CheckCircle,
} from 'lucide-react'
import type { UserRole } from '../types'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  badgeKey?: 'contactRequests' | 'pendingClients' | 'notifications'
}

export interface NavSection {
  title: string
  items: NavItem[]
}

const adminNav: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
      { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Employees', to: '/admin/employees', icon: Users },
      { label: 'Admins', to: '/admin/admins', icon: UserCog },
      { label: 'Clients', to: '/admin/clients', icon: UserCheck },
      { label: 'Verification', to: '/admin/verification', icon: ShieldCheck, badgeKey: 'pendingClients' },
      { label: 'Projects', to: '/admin/projects', icon: FolderKanban },
      { label: 'Tasks', to: '/admin/tasks', icon: ListChecks },
      { label: 'Attendance', to: '/admin/attendance', icon: Calendar },
      { label: 'Leave Requests', to: '/admin/leave-requests', icon: CheckCircle },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Contact Requests', to: '/admin/contact-requests', icon: Inbox, badgeKey: 'contactRequests' },
      { label: 'Invoices', to: '/admin/invoices', icon: Receipt },
      { label: 'Audit Logs', to: '/admin/audit-logs', icon: ClipboardList },
    ],
  },
  {
    title: 'Collaboration',
    items: [
      { label: 'Messages', to: '/admin/messages', icon: MessageSquare },
      { label: 'Meetings', to: '/admin/meetings', icon: CalendarDays },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', to: '/admin/notifications', icon: Bell, badgeKey: 'notifications' },
      { label: 'Profile', to: '/admin/profile', icon: User },
      { label: 'Settings', to: '/admin/settings', icon: Settings },
    ],
  },
]

const employeeNav: NavSection[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', to: '/employee', icon: LayoutDashboard }],
  },
  {
    title: 'Work',
    items: [
      { label: 'Projects', to: '/employee/projects', icon: FolderKanban },
      { label: 'Task Board', to: '/employee/tasks', icon: KanbanSquare },
      { label: 'My Tasks', to: '/employee/my-tasks', icon: ListChecks },
      { label: 'Clients', to: '/employee/clients', icon: UserCheck },
      { label: 'Calendar', to: '/employee/calendar', icon: CalendarDays },
    ],
  },
  {
    title: 'Team',
    items: [
      { label: 'Messages', to: '/employee/messages', icon: MessageSquare },
      { label: 'Attendance', to: '/employee/attendance', icon: Clock },
      { label: 'Documents', to: '/employee/documents', icon: FileText },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', to: '/employee/notifications', icon: Bell, badgeKey: 'notifications' },
      { label: 'Profile', to: '/employee/profile', icon: User },
      { label: 'Settings', to: '/employee/settings', icon: Settings },
    ],
  },
]

const clientNav: NavSection[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', to: '/client', icon: LayoutDashboard }],
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Projects', to: '/client/projects', icon: FolderKanban },
      { label: 'Invoices', to: '/client/invoices', icon: Receipt },
      { label: 'Documents', to: '/client/documents', icon: FileText },
      { label: 'Meetings', to: '/client/meetings', icon: CalendarDays },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Support Tickets', to: '/client/support', icon: LifeBuoy },
      { label: 'Messages', to: '/client/messages', icon: MessageSquare },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', to: '/client/notifications', icon: Bell, badgeKey: 'notifications' },
      { label: 'Profile', to: '/client/profile', icon: User },
      { label: 'Settings', to: '/client/settings', icon: Settings },
    ],
  },
]

export const navByRole: Record<UserRole, NavSection[]> = {
  admin: adminNav,
  employee: employeeNav,
  client: clientNav,
}








export const APP_CONFIG = {
  name: 'DigiAyudh',
  tagline: 'Digital Weapons for the Future',
  description:
    'Premium enterprise software company building websites, web apps, mobile apps, ERP, CRM, HRMS, AI solutions, and digital transformation platforms.',
  url: 'https://digiayudh.com',
  supportEmail: 'hello@digiayudh.com',
  phone: '+91 98765 43210',
} as const;

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const AUTH_CONFIG = {
  tokenKey: 'digiayudh_access_token',
  refreshTokenKey: 'digiayudh_refresh_token',
  userKey: 'digiayudh_user',
  tokenExpiryKey: 'digiayudh_token_expiry',
} as const;

export const ROUTES = {
  public: {
    home: '/',
    services: '/#services',
    work: '/#work',
    process: '/#process',
    pricing: '/#pricing',
    contact: '/#contact',
    login: '/login',
  },
  client: {
    dashboard: '/client/dashboard',
    projects: '/client/projects',
    support: '/client/support',
    profile: '/client/profile',
  },
  employee: {
    dashboard: '/employee/dashboard',
    tasks: '/employee/tasks',
    profile: '/employee/profile',
  },
  admin: {
    dashboard: '/admin/dashboard',
    clients: '/admin/clients',
    projects: '/admin/projects',
    employees: '/admin/employees',
    settings: '/admin/settings',
  },
  superAdmin: {
    dashboard: '/super-admin/dashboard',
    tenants: '/super-admin/tenants',
    settings: '/super-admin/settings',
  },
} as const;
