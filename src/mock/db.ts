import type {
  User,
  Project,
  Task,
  Employee,
  Lead,
  Chat,
  Message,
  Notification,
  ContactRequest,
  Invoice,
  Meeting,
  DocumentFile,
  SupportTicket,
  AuditLog,
  Attendance,
} from "../types"

/* Utilities ---------------------------------------------------------- */
let counter = 1000
export const uid = (prefix = "id") => `${prefix}_${(counter++).toString(36)}${Date.now().toString(36).slice(-4)}`
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000)
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000)

const COMPANY = "digiayudh"

/* Credential map for mock auth (email -> password) ------------------- */
export const credentials: Record<string, string> = {
  "admin@digiayudh.com": "admin123",
  "sarah.admin@digiayudh.com": "admin123",
  "employee@digiayudh.com": "emp123",
  "james.dev@digiayudh.com": "emp123",
  "maya.design@digiayudh.com": "emp123",
  "client@acme.com": "client123",
  "pending@startup.com": "pending123",
  "rejected@oldco.com": "reject123",
}

/* Password reset tokens for mock auth ----------------------------------- */
export const resetTokens: Array<{ token: string; userId: string; expiresAt: Date }> = []

/* Users -------------------------------------------------------------- */
export const users: User[] = [
  {
    _id: "u_admin_1",
    name: "Alex Morgan",
    email: "admin@digiayudh.com",
    phone: "+1 555 0100",
    role: "admin",
    department: "Management",
    position: "Chief Operating Officer",
    joinDate: daysAgo(720),
    isActive: true,
    company: COMPANY,
    city: "San Francisco",
    country: "USA",
    verificationStatus: "verified",
    createdAt: daysAgo(720),
    updatedAt: daysAgo(2),
  },
  {
    _id: "u_admin_2",
    name: "Sarah Chen",
    email: "sarah.admin@digiayudh.com",
    phone: "+1 555 0101",
    role: "admin",
    department: "Operations",
    position: "Operations Director",
    joinDate: daysAgo(500),
    isActive: true,
    company: COMPANY,
    city: "New York",
    country: "USA",
    verificationStatus: "verified",
    createdAt: daysAgo(500),
    updatedAt: daysAgo(5),
  },
  {
    _id: "u_emp_1",
    name: "James Wilson",
    email: "employee@digiayudh.com",
    phone: "+1 555 0110",
    role: "employee",
    department: "Engineering",
    position: "Senior Developer",
    joinDate: daysAgo(400),
    isActive: true,
    company: COMPANY,
    city: "Austin",
    country: "USA",
    verificationStatus: "verified",
    createdAt: daysAgo(400),
    updatedAt: daysAgo(1),
  },
  {
    _id: "u_emp_2",
    name: "James Dev",
    email: "james.dev@digiayudh.com",
    phone: "+1 555 0111",
    role: "employee",
    department: "Engineering",
    position: "Backend Engineer",
    joinDate: daysAgo(300),
    isActive: true,
    company: COMPANY,
    city: "Seattle",
    country: "USA",
    verificationStatus: "verified",
    createdAt: daysAgo(300),
    updatedAt: daysAgo(3),
  },
  {
    _id: "u_emp_3",
    name: "Maya Patel",
    email: "maya.design@digiayudh.com",
    phone: "+1 555 0112",
    role: "employee",
    department: "Design",
    position: "Lead Product Designer",
    joinDate: daysAgo(250),
    isActive: true,
    company: COMPANY,
    city: "Los Angeles",
    country: "USA",
    verificationStatus: "verified",
    createdAt: daysAgo(250),
    updatedAt: daysAgo(4),
  },
  {
    _id: "u_client_1",
    name: "David Kim",
    email: "client@acme.com",
    phone: "+1 555 0200",
    role: "client",
    company: COMPANY,
    companyName: "Acme Corporation",
    position: "VP Product",
    city: "Chicago",
    state: "IL",
    country: "USA",
    joinDate: daysAgo(180),
    isActive: true,
    verificationStatus: "verified",
    assignedEmployeeId: "u_emp_1",
    createdAt: daysAgo(180),
    updatedAt: daysAgo(6),
  },
  {
    _id: "u_client_2",
    name: "Elena Rodriguez",
    email: "pending@startup.com",
    phone: "+1 555 0201",
    role: "client",
    company: COMPANY,
    companyName: "Startup Labs Inc",
    position: "Founder",
    city: "Miami",
    state: "FL",
    country: "USA",
    joinDate: daysAgo(2),
    isActive: true,
    verificationStatus: "pending",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    _id: "u_client_3",
    name: "Robert Frost",
    email: "rejected@oldco.com",
    phone: "+1 555 0202",
    role: "client",
    company: COMPANY,
    companyName: "OldCo Ltd",
    city: "Boston",
    state: "MA",
    country: "USA",
    joinDate: daysAgo(20),
    isActive: false,
    verificationStatus: "rejected",
    rejectionReason: "Company details could not be verified. Please resubmit with valid registration documents.",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(15),
  },
  {
    _id: "u_client_4",
    name: "Nina Williams",
    email: "nina@brightco.com",
    phone: "+1 555 0203",
    role: "client",
    company: COMPANY,
    companyName: "BrightCo",
    city: "Denver",
    state: "CO",
    country: "USA",
    joinDate: daysAgo(1),
    isActive: true,
    verificationStatus: "pending",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
]

/* Projects ----------------------------------------------------------- */
export const projects: Project[] = [
  {
    _id: "p_1",
    title: "Acme E-Commerce Platform",
    description: "Full rebuild of the Acme storefront with headless commerce and a new checkout flow.",
    status: "active",
    startDate: daysAgo(90),
    endDate: daysFromNow(60),
    budget: 120000,
    budget_used: 68000,
    priority: "high",
    clientId: "u_client_1",
    managerId: "u_emp_1",
    teamMembers: ["u_emp_1", "u_emp_2", "u_emp_3"],
    company: COMPANY,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(2),
  },
  {
    _id: "p_2",
    title: "Mobile Banking App",
    description: "iOS and Android app for retail banking with biometric auth and real-time transfers.",
    status: "active",
    startDate: daysAgo(45),
    endDate: daysFromNow(120),
    budget: 200000,
    budget_used: 52000,
    priority: "critical",
    clientId: "u_client_1",
    managerId: "u_emp_2",
    teamMembers: ["u_emp_2", "u_emp_3"],
    company: COMPANY,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(1),
  },
  {
    _id: "p_3",
    title: "Brand Redesign System",
    description: "New design language, component library and marketing site refresh.",
    status: "planning",
    startDate: daysFromNow(10),
    budget: 60000,
    budget_used: 0,
    priority: "medium",
    clientId: "u_client_1",
    managerId: "u_emp_3",
    teamMembers: ["u_emp_3"],
    company: COMPANY,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(3),
  },
  {
    _id: "p_4",
    title: "Data Warehouse Migration",
    description: "Migrate legacy reporting into a modern cloud data warehouse.",
    status: "completed",
    startDate: daysAgo(220),
    endDate: daysAgo(30),
    budget: 90000,
    budget_used: 88500,
    priority: "high",
    clientId: "u_client_1",
    managerId: "u_emp_1",
    teamMembers: ["u_emp_1", "u_emp_2"],
    company: COMPANY,
    createdAt: daysAgo(220),
    updatedAt: daysAgo(30),
  },
  {
    _id: "p_5",
    title: "Internal HR Portal",
    description: "Self-service HR portal for onboarding, leave and payroll.",
    status: "on-hold",
    startDate: daysAgo(60),
    budget: 45000,
    budget_used: 15000,
    priority: "low",
    clientId: "u_client_1",
    managerId: "u_emp_2",
    teamMembers: ["u_emp_2", "u_emp_3"],
    company: COMPANY,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(12),
  },
]

/* Tasks -------------------------------------------------------------- */
const taskSeed: Array<Partial<Task> & { title: string; status: Task["status"]; projectId: string }> = [
  { title: "Set up CI/CD pipeline", status: "completed", projectId: "p_1", priority: "high", assignedTo: "u_emp_1" },
  { title: "Design product listing page", status: "completed", projectId: "p_1", priority: "medium", assignedTo: "u_emp_3" },
  { title: "Implement cart & checkout", status: "in-progress", projectId: "p_1", priority: "high", assignedTo: "u_emp_2" },
  { title: "Payment gateway integration", status: "in-progress", projectId: "p_1", priority: "high", assignedTo: "u_emp_1" },
  { title: "QA regression suite", status: "todo", projectId: "p_1", priority: "medium", assignedTo: "u_emp_2" },
  { title: "Biometric auth flow", status: "in-progress", projectId: "p_2", priority: "high", assignedTo: "u_emp_2" },
  { title: "Account dashboard UI", status: "review", projectId: "p_2", priority: "medium", assignedTo: "u_emp_3" },
  { title: "Transfer API contract", status: "todo", projectId: "p_2", priority: "high", assignedTo: "u_emp_2" },
  { title: "Define color tokens", status: "todo", projectId: "p_3", priority: "medium", assignedTo: "u_emp_3" },
  { title: "Component audit", status: "todo", projectId: "p_3", priority: "low", assignedTo: "u_emp_3" },
  { title: "Data model mapping", status: "completed", projectId: "p_4", priority: "high", assignedTo: "u_emp_1" },
  { title: "Cutover rehearsal", status: "completed", projectId: "p_4", priority: "high", assignedTo: "u_emp_2" },
]
export const tasks: Task[] = taskSeed.map((t, i) => ({
  _id: `t_${i + 1}`,
  title: t.title,
  description: "Detailed task description and acceptance criteria go here.",
  status: t.status,
  priority: (t.priority ?? "medium") as Task["priority"],
  projectId: t.projectId,
  assignedTo: t.assignedTo ?? "u_emp_1",
  createdBy: "u_emp_1",
  dueDate: daysFromNow(((i % 5) + 1) * 3),
  estimatedHours: 8 + i,
  actualHours: t.status === "completed" ? 6 + i : undefined,
  company: COMPANY,
  createdAt: daysAgo(30 - i),
  updatedAt: daysAgo(i),
}))

/* Employees (HR records) --------------------------------------------- */
export const employees: Employee[] = [
  {
    _id: "e_1", userId: "u_emp_1", name: "James Wilson", email: "employee@digiayudh.com",
    position: "Senior Developer", department: "Engineering", salary: 125000, joiningDate: daysAgo(400),
    phone: "+1 555 0110", address: "12 Oak St", city: "Austin", country: "USA", isActive: true,
    company: COMPANY, createdAt: daysAgo(400), updatedAt: daysAgo(1),
  },
  {
    _id: "e_2", userId: "u_emp_2", name: "James Dev", email: "james.dev@digiayudh.com",
    position: "Backend Engineer", department: "Engineering", salary: 110000, joiningDate: daysAgo(300),
    phone: "+1 555 0111", address: "88 Pine Ave", city: "Seattle", country: "USA", isActive: true,
    company: COMPANY, createdAt: daysAgo(300), updatedAt: daysAgo(3),
  },
  {
    _id: "e_3", userId: "u_emp_3", name: "Maya Patel", email: "maya.design@digiayudh.com",
    position: "Lead Product Designer", department: "Design", salary: 118000, joiningDate: daysAgo(250),
    phone: "+1 555 0112", address: "5 Sunset Blvd", city: "Los Angeles", country: "USA", isActive: true,
    company: COMPANY, createdAt: daysAgo(250), updatedAt: daysAgo(4),
  },
]

/* Leads -------------------------------------------------------------- */
export const leads: Lead[] = [
  { _id: "l_1", name: "TechFlow Solutions", email: "hello@techflow.io", phone: "+1 555 0300", company: "TechFlow", source: "Website", status: "new", budget: 50000, assignedTo: "u_emp_1", company_id: COMPANY, createdAt: daysAgo(3), updatedAt: daysAgo(3) },
  { _id: "l_2", name: "GreenLeaf Retail", email: "ops@greenleaf.com", phone: "+1 555 0301", company: "GreenLeaf", source: "Referral", status: "qualified", budget: 90000, assignedTo: "u_emp_2", company_id: COMPANY, createdAt: daysAgo(9), updatedAt: daysAgo(2) },
  { _id: "l_3", name: "Nova Fintech", email: "growth@novafin.com", phone: "+1 555 0302", company: "Nova", source: "LinkedIn", status: "proposal", budget: 150000, assignedTo: "u_emp_1", company_id: COMPANY, createdAt: daysAgo(15), updatedAt: daysAgo(1) },
  { _id: "l_4", name: "Urban Eats", email: "founder@urbaneats.com", phone: "+1 555 0303", company: "Urban Eats", source: "Event", status: "contacted", budget: 30000, company_id: COMPANY, createdAt: daysAgo(20), updatedAt: daysAgo(5) },
  { _id: "l_5", name: "Skyline Media", email: "partners@skyline.tv", phone: "+1 555 0304", company: "Skyline", source: "Website", status: "closed", budget: 75000, assignedTo: "u_emp_2", company_id: COMPANY, createdAt: daysAgo(40), updatedAt: daysAgo(10) },
]

/* Chats & messages --------------------------------------------------- */
export const chats: Chat[] = [
  { _id: "c_1", participants: ["u_emp_1", "u_client_1"], participantNames: ["James Wilson", "David Kim"], lastMessage: "Sounds great, thanks!", lastMessageTime: daysAgo(0), isGroup: false, company: COMPANY, createdAt: daysAgo(30), updatedAt: daysAgo(0) },
  { _id: "c_2", participants: ["u_emp_1", "u_emp_2", "u_emp_3"], participantNames: ["James Wilson", "James Dev", "Maya Patel"], lastMessage: "Pushed the fix to staging.", lastMessageTime: daysAgo(0), isGroup: true, groupName: "Acme Project Team", company: COMPANY, createdAt: daysAgo(60), updatedAt: daysAgo(0) },
]
export const messages: Message[] = [
  { _id: "m_1", senderId: "u_client_1", senderName: "David Kim", content: "Hi, any update on the checkout flow?", chatId: "c_1", isRead: true, createdAt: new Date(Date.now() - 3600000) },
  { _id: "m_2", senderId: "u_emp_1", senderName: "James Wilson", content: "Yes! We deployed it to staging this morning.", chatId: "c_1", isRead: true, createdAt: new Date(Date.now() - 3000000) },
  { _id: "m_3", senderId: "u_client_1", senderName: "David Kim", content: "Sounds great, thanks!", chatId: "c_1", isRead: false, createdAt: new Date(Date.now() - 1800000) },
  { _id: "m_4", senderId: "u_emp_2", senderName: "James Dev", content: "Pushed the fix to staging.", chatId: "c_2", isRead: false, createdAt: new Date(Date.now() - 1200000) },
]

/* Notifications ------------------------------------------------------ */
export const notifications: Notification[] = [
  { _id: "n_1", userId: "u_admin_1", title: "New client signup", message: "Elena Rodriguez from Startup Labs is awaiting verification.", type: "info", isRead: false, link: "/admin/clients", createdAt: daysAgo(2) },
  { _id: "n_2", userId: "u_admin_1", title: "New contact request", message: "A new enquiry was submitted via the contact form.", type: "info", isRead: false, link: "/admin/contact-requests", createdAt: daysAgo(1) },
  { _id: "n_3", userId: "u_emp_1", title: "Task due soon", message: "Payment gateway integration is due in 3 days.", type: "warning", isRead: false, link: "/tasks", createdAt: daysAgo(0) },
  { _id: "n_4", userId: "u_client_1", title: "Invoice paid", message: "Your invoice INV-1002 has been marked as paid.", type: "success", isRead: true, link: "/client/invoices", createdAt: daysAgo(4) },
]

/* Contact requests --------------------------------------------------- */
export const contactRequests: ContactRequest[] = [
  { _id: "cr_1", name: "Priya Sharma", email: "priya@fabricco.com", phone: "+1 555 0400", company: "FabricCo", subject: "New website project", message: "We are looking to rebuild our e-commerce site and would love a quote.", status: "new", createdAt: daysAgo(1), updatedAt: daysAgo(1) },
  { _id: "cr_2", name: "Tom Becker", email: "tom@logistix.com", phone: "+1 555 0401", company: "Logistix", subject: "Mobile app enquiry", message: "Interested in a logistics tracking app for our fleet.", status: "in-review", createdAt: daysAgo(3), updatedAt: daysAgo(2) },
  { _id: "cr_3", name: "Aisha Khan", email: "aisha@medplus.com", company: "MedPlus", subject: "Partnership", message: "Exploring a long-term development partnership.", status: "responded", createdAt: daysAgo(6), updatedAt: daysAgo(4) },
]

/* Invoices ----------------------------------------------------------- */
export const invoices: Invoice[] = [
  { _id: "inv_1", number: "INV-1001", clientId: "u_client_1", clientName: "Acme Corporation", projectId: "p_1", amount: 20000, tax: 2000, total: 22000, status: "paid", issueDate: daysAgo(60), dueDate: daysAgo(30), items: [{ description: "Sprint 1-2 development", quantity: 1, rate: 20000 }], createdAt: daysAgo(60) },
  { _id: "inv_2", number: "INV-1002", clientId: "u_client_1", clientName: "Acme Corporation", projectId: "p_1", amount: 24000, tax: 2400, total: 26400, status: "paid", issueDate: daysAgo(30), dueDate: daysAgo(1), items: [{ description: "Sprint 3-4 development", quantity: 1, rate: 24000 }], createdAt: daysAgo(30) },
  { _id: "inv_3", number: "INV-1003", clientId: "u_client_1", clientName: "Acme Corporation", projectId: "p_2", amount: 30000, tax: 3000, total: 33000, status: "sent", issueDate: daysAgo(10), dueDate: daysFromNow(20), items: [{ description: "Mobile app milestone 1", quantity: 1, rate: 30000 }], createdAt: daysAgo(10) },
  { _id: "inv_4", number: "INV-1004", clientId: "u_client_1", clientName: "Acme Corporation", amount: 15000, tax: 1500, total: 16500, status: "overdue", issueDate: daysAgo(50), dueDate: daysAgo(20), items: [{ description: "Consulting retainer", quantity: 1, rate: 15000 }], createdAt: daysAgo(50) },
]

/* Meetings ----------------------------------------------------------- */
export const meetings: Meeting[] = [
  { _id: "mt_1", title: "Sprint Review", description: "Demo of checkout flow", start: daysFromNow(1), end: daysFromNow(1), attendees: ["u_emp_1", "u_client_1"], organizerId: "u_emp_1", clientId: "u_client_1", link: "https://meet.example.com/abc", status: "scheduled", createdAt: daysAgo(2) },
  { _id: "mt_2", title: "Design Handoff", description: "Walk through the new design system", start: daysFromNow(3), end: daysFromNow(3), attendees: ["u_emp_3", "u_client_1"], organizerId: "u_emp_3", clientId: "u_client_1", link: "https://meet.example.com/def", status: "scheduled", createdAt: daysAgo(1) },
  { _id: "mt_3", title: "Kickoff Call", description: "Project kickoff", start: daysAgo(30), end: daysAgo(30), attendees: ["u_emp_1", "u_client_1"], organizerId: "u_emp_1", clientId: "u_client_1", status: "completed", createdAt: daysAgo(32) },
]

/* Documents ---------------------------------------------------------- */
export const documents: DocumentFile[] = [
  { _id: "d_1", name: "Master Services Agreement.pdf", type: "pdf", size: 248000, category: "contract", ownerId: "u_client_1", url: "#", createdAt: daysAgo(120) },
  { _id: "d_2", name: "Acme Platform SOW.pdf", type: "pdf", size: 180000, category: "contract", ownerId: "u_client_1", projectId: "p_1", url: "#", createdAt: daysAgo(90) },
  { _id: "d_3", name: "Brand Guidelines.pdf", type: "pdf", size: 5400000, category: "asset", ownerId: "u_client_1", projectId: "p_3", url: "#", createdAt: daysAgo(20) },
  { _id: "d_4", name: "Q2 Progress Report.docx", type: "docx", size: 96000, category: "report", ownerId: "u_client_1", url: "#", createdAt: daysAgo(15) },
]

/* Support tickets ---------------------------------------------------- */
export const supportTickets: SupportTicket[] = [
  { _id: "s_1", subject: "Cannot access invoice PDF", description: "The download button on invoice INV-1003 doesn't work.", priority: "medium", status: "open", category: "Billing", createdBy: "u_client_1", createdByName: "David Kim", replies: [], createdAt: daysAgo(2), updatedAt: daysAgo(2) },
  { _id: "s_2", subject: "Request additional team member", description: "We would like to add another developer to the mobile project.", priority: "low", status: "in-progress", category: "Project", createdBy: "u_client_1", createdByName: "David Kim", assignedTo: "u_emp_1", replies: [{ authorId: "u_emp_1", authorName: "James Wilson", message: "Thanks, we're reviewing capacity and will confirm shortly.", createdAt: daysAgo(1) }], createdAt: daysAgo(4), updatedAt: daysAgo(1) },
]

/* Audit logs --------------------------------------------------------- */
export const auditLogs: AuditLog[] = [
  { _id: "a_1", actorId: "u_admin_1", actorName: "Alex Morgan", action: "verified", entity: "Client", entityId: "u_client_1", details: "Verified Acme Corporation", ipAddress: "10.0.0.4", createdAt: daysAgo(180) },
  { _id: "a_2", actorId: "u_admin_1", actorName: "Alex Morgan", action: "created", entity: "Employee", entityId: "u_emp_3", details: "Added Maya Patel", ipAddress: "10.0.0.4", createdAt: daysAgo(250) },
  { _id: "a_3", actorId: "u_admin_2", actorName: "Sarah Chen", action: "rejected", entity: "Client", entityId: "u_client_3", details: "Rejected OldCo Ltd", ipAddress: "10.0.0.9", createdAt: daysAgo(15) },
  { _id: "a_4", actorId: "u_emp_1", actorName: "James Wilson", action: "updated", entity: "Project", entityId: "p_1", details: "Updated project status", ipAddress: "10.0.0.12", createdAt: daysAgo(2) },
]

/* Attendance --------------------------------------------------------- */
export let attendance: Attendance[] = Array.from({ length: 10 }).map((_, i) => ({
  _id: `at_${i + 1}`,
  employeeId: "u_emp_1",
  employeeName: "James Wilson",
  date: daysAgo(i),
  checkIn: "09:0" + (i % 6),
  checkOut: "17:3" + (i % 6),
  status: (i % 7 === 0 ? "remote" : i % 5 === 0 ? "late" : "present") as Attendance["status"],
  hours: 8,
}))

/* Leave Requests ----------------------------------------------------- */
export let leaveRequests: Array<{
  _id: string
  employeeId: string
  employeeName: string
  startDate: string
  endDate: string
  reason: string
  leaveType: 'sick' | 'personal' | 'vacation' | 'other'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  approvedBy?: string
  rejectionReason?: string
}> = [
  { _id: "leave_1", employeeId: "u_emp_1", employeeName: "James Wilson", startDate: daysFromNow(7).toISOString().split('T')[0], endDate: daysFromNow(9).toISOString().split('T')[0], leaveType: "vacation", reason: "Summer vacation", status: "pending", createdAt: daysAgo(3).toISOString() },
  { _id: "leave_2", employeeId: "u_emp_2", employeeName: "James Dev", startDate: daysFromNow(14).toISOString().split('T')[0], endDate: daysFromNow(14).toISOString().split('T')[0], leaveType: "sick", reason: "Medical appointment", status: "approved", createdAt: daysAgo(5).toISOString(), approvedBy: "u_admin_1" },
]

/* To-Do Lists -------------------------------------------------------- */
export let todos: Array<{
  _id: string
  taskId: string
  employeeId: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}> = [
  { _id: "todo_1", taskId: "t_1", employeeId: "u_emp_1", title: "Complete project documentation", description: "Write comprehensive docs for API", completed: false, priority: "high", dueDate: daysFromNow(2), createdAt: daysAgo(1), updatedAt: daysAgo(1) },
  { _id: "todo_2", taskId: "t_1", employeeId: "u_emp_1", title: "Review pull request from John", completed: false, priority: "medium", dueDate: daysFromNow(1), createdAt: daysAgo(2), updatedAt: daysAgo(1) },
  { _id: "todo_3", taskId: "t_2", employeeId: "u_emp_1", title: "Update database schema", completed: true, priority: "high", dueDate: daysAgo(1), createdAt: daysAgo(5), updatedAt: daysAgo(1) },
  { _id: "todo_4", taskId: "t_3", employeeId: "u_emp_2", title: "Design UI mockups", completed: false, priority: "medium", dueDate: daysFromNow(3), createdAt: daysAgo(1), updatedAt: daysAgo(1) },
]
