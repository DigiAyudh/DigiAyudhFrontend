import * as db from "./db"
import type {
  User,
  ContactRequest,
  SupportTicket,
  Invoice,
  Meeting,
  DashboardStat,
} from "../types"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const LATENCY = 350

function delay<T>(data: T, ms = LATENCY): Promise<{ data: T }> {
  return new Promise((resolve) => setTimeout(() => resolve({ data }), ms))
}

export class MockError extends Error {
  status: number
  isMockError = true
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

function fail(message: string, status = 400, ms = LATENCY): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new MockError(message, status)), ms))
}

const TOKEN_PREFIX = "mocktoken."
const makeToken = (userId: string) => `${TOKEN_PREFIX}${userId}`

export function currentUserId(): string | null {
  const token = localStorage.getItem("token")
  if (!token || !token.startsWith(TOKEN_PREFIX)) return null
  return token.slice(TOKEN_PREFIX.length)
}

function currentUser(): User | null {
  const id = currentUserId()
  return id ? db.users.find((u) => u._id === id) ?? null : null
}

function log(action: string, entity: string, entityId?: string, details?: string) {
  const actor = currentUser()
  db.auditLogs.unshift({
    _id: db.uid("a"),
    actorId: actor?._id ?? "system",
    actorName: actor?.name ?? "System",
    action,
    entity,
    entityId,
    details,
    ipAddress: "10.0.0." + Math.floor(Math.random() * 200),
    createdAt: new Date(),
  })
}

/* ------------------------------------------------------------------ */
/*  Mock API surface (mirrors ApiClient method semantics)             */
/* ------------------------------------------------------------------ */
export const mockApi = {
  /* ---- Auth ---- */
  login(email: string, password: string, expectedRole?: string) {
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user || db.credentials[email.toLowerCase()] !== password) {
      return fail("Invalid email or password", 401)
    }
    if (expectedRole && user.role !== expectedRole) {
      return fail(`This account is not registered as a ${expectedRole}.`, 403)
    }
    if (!user.isActive) return fail("This account has been deactivated.", 403)
    log("logged in", "Auth", user._id)
    return delay({
      success: true,
      message: "Login successful",
      token: makeToken(user._id),
      refreshToken: makeToken(user._id) + ".refresh",
      user,
    })
  },

  clientSignup(data: Record<string, any>) {
    const email = String(data.email || "").toLowerCase()
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      return fail("An account with this email already exists.", 409)
    }
    if (data.password !== data.confirmPassword) {
      return fail("Passwords do not match.", 400)
    }
    const now = new Date()
    const user: User = {
      _id: db.uid("u_client"),
      name: data.name,
      email,
      phone: `${data.countryCode ?? ""} ${data.phone ?? ""}`.trim(),
      role: "client",
      company: "digiayudh",
      companyName: data.companyName,
      city: data.city,
      state: data.state,
      country: data.country,
      joinDate: now,
      isActive: true,
      verificationStatus: "pending",
      createdAt: now,
      updatedAt: now,
    }
    db.users.push(user)
    db.credentials[email] = data.password
    db.notifications.unshift({
      _id: db.uid("n"),
      userId: "u_admin_1",
      title: "New client signup",
      message: `${user.name} from ${user.companyName ?? "a company"} is awaiting verification.`,
      type: "info",
      isRead: false,
      link: "/admin/clients",
      createdAt: now,
    })
    log("signed up", "Client", user._id, `New client ${user.name}`)
    return delay({
      success: true,
      message: "Signup successful. Your account is pending verification.",
      token: makeToken(user._id),
      refreshToken: makeToken(user._id) + ".refresh",
      user,
    })
  },

  getMe() {
    const user = currentUser()
    if (!user) return fail("Not authenticated", 401)
    return delay({ success: true, user })
  },

  logout() {
    return delay({ success: true })
  },

  refresh(_refreshToken: string) {
    const user = currentUser()
    if (!user) return fail("Session expired", 401)
    return delay({ token: makeToken(user._id), refreshToken: makeToken(user._id) + ".refresh" })
  },

  requestPasswordReset(email: string) {
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      // Don't reveal if email exists - security best practice
      return delay({ success: true, message: "If this email exists, a reset link has been sent." })
    }
    // Store reset token in mock storage (in real app, this would be sent via email)
    const resetToken = `reset_${user._id}_${Date.now()}`
    db.resetTokens = db.resetTokens || []
    db.resetTokens.push({ token: resetToken, userId: user._id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) })
    log("requested password reset", "Auth", user._id)
    return delay({ success: true, message: "Password reset link sent to your email" })
  },

  verifyPasswordResetToken(token: string) {
    const db_with_tokens = db as any
    if (!db_with_tokens.resetTokens) {
      return fail("Invalid or expired reset token", 400)
    }
    const resetToken = db_with_tokens.resetTokens.find((t: any) => t.token === token && t.expiresAt > new Date())
    if (!resetToken) {
      return fail("Invalid or expired reset token", 400)
    }
    return delay({ success: true, message: "Token is valid" })
  },

  resetPassword(token: string, password: string) {
    const db_with_tokens = db as any
    if (!db_with_tokens.resetTokens) {
      return fail("Invalid or expired reset token", 400)
    }
    const resetTokenIndex = db_with_tokens.resetTokens.findIndex((t: any) => t.token === token && t.expiresAt > new Date())
    if (resetTokenIndex === -1) {
      return fail("Invalid or expired reset token", 400)
    }
    const resetToken = db_with_tokens.resetTokens[resetTokenIndex]
    const user = db.users.find((u) => u._id === resetToken.userId)
    if (!user) {
      return fail("User not found", 404)
    }
    // Update password
    db.credentials[user.email.toLowerCase()] = password
    // Remove used token
    db_with_tokens.resetTokens.splice(resetTokenIndex, 1)
    log("reset password", "Auth", user._id)
    return delay({ success: true, message: "Password reset successfully" })
  },

  sendOtp() {
    return delay({ success: true, message: "OTP sent (use 123456 in demo mode)" })
  },
  verifyOtp(_phone: string, otp: string) {
    if (otp !== "123456") return fail("Invalid OTP. Use 123456 in demo mode.", 400)
    return delay({ success: true, verified: true })
  },

  /* ---- Users / clients / employees accounts ---- */
  getUsers() {
    return delay({ success: true, data: db.users })
  },
  getUserById(id: string) {
    const u = db.users.find((x) => x._id === id)
    return u ? delay({ success: true, data: u }) : fail("User not found", 404)
  },
  updateUser(id: string, data: Record<string, unknown>) {
    const u = db.users.find((x) => x._id === id)
    if (!u) return fail("User not found", 404)
    Object.assign(u, data, { updatedAt: new Date() })
    log("updated", "User", id)
    return delay({ success: true, data: u })
  },

  getClients() {
    return delay({ success: true, data: db.users.filter((u) => u.role === "client") })
  },
  getEmployeeAccounts() {
    return delay({ success: true, data: db.users.filter((u) => u.role === "employee" || u.role === "admin") })
  },
  createEmployeeAccount(data: Record<string, any>) {
    const email = String(data.email || "").toLowerCase()
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      return fail("An account with this email already exists.", 409)
    }
    const now = new Date()
    const user: User = {
      _id: db.uid("u_emp"),
      name: data.name,
      email,
      phone: data.phone,
      role: (data.role as User["role"]) || "employee",
      department: data.department,
      position: data.position,
      company: "digiayudh",
      joinDate: now,
      isActive: true,
      verificationStatus: "verified",
      createdAt: now,
      updatedAt: now,
    }
    db.users.push(user)
    db.credentials[email] = data.password || "password123"
    log("created", "Employee", user._id, `Added ${user.name}`)
    return delay({ success: true, data: user })
  },
  updateEmployeeAccount(id: string, data: Record<string, unknown>) {
    return this.updateUser(id, data)
  },
  deleteEmployeeAccount(id: string) {
    const idx = db.users.findIndex((u) => u._id === id)
    if (idx === -1) return fail("Account not found", 404)
    const [removed] = db.users.splice(idx, 1)
    log("deleted", "Employee", id, `Removed ${removed.name}`)
    return delay({ success: true })
  },
  resetEmployeePassword(id: string, newPassword: string) {
    const u = db.users.find((x) => x._id === id)
    if (!u) return fail("Account not found", 404)
    db.credentials[u.email.toLowerCase()] = newPassword
    log("reset password", "Employee", id)
    return delay({ success: true })
  },
  assignClientToEmployee(clientId: string, employeeId: string) {
    const c = db.users.find((u) => u._id === clientId)
    if (!c) return fail("Client not found", 404)
    c.assignedEmployeeId = employeeId
    log("assigned", "Client", clientId, `Assigned to employee ${employeeId}`)
    return delay({ success: true, data: c })
  },

  /* ---- Client verification ---- */
  verifyClient(clientId: string) {
    const c = db.users.find((u) => u._id === clientId)
    if (!c) return fail("Client not found", 404)
    c.verificationStatus = "verified"
    c.isActive = true
    c.rejectionReason = undefined
    c.updatedAt = new Date()
    db.notifications.unshift({
      _id: db.uid("n"), userId: c._id, title: "Account verified",
      message: "Your account has been verified. Welcome aboard!", type: "success",
      isRead: false, link: "/client/dashboard", createdAt: new Date(),
    })
    log("verified", "Client", clientId, `Verified ${c.name}`)
    return delay({ success: true, data: c })
  },
  rejectClient(clientId: string, reason: string) {
    const c = db.users.find((u) => u._id === clientId)
    if (!c) return fail("Client not found", 404)
    c.verificationStatus = "rejected"
    c.rejectionReason = reason
    c.updatedAt = new Date()
    log("rejected", "Client", clientId, `Rejected ${c.name}: ${reason}`)
    return delay({ success: true, data: c })
  },

  /* ---- Projects ---- */
  getProjects() {
    return delay({ success: true, data: db.projects })
  },
  getProjectById(id: string) {
    const p = db.projects.find((x) => x._id === id)
    return p ? delay({ success: true, data: p }) : fail("Project not found", 404)
  },
  createProject(data: Record<string, any>) {
    const now = new Date()
    const project = {
      _id: db.uid("p"), title: data.title, description: data.description ?? "",
      status: data.status ?? "planning", startDate: data.startDate ? new Date(data.startDate) : now,
      endDate: data.endDate ? new Date(data.endDate) : undefined, budget: Number(data.budget) || 0,
      budget_used: 0, priority: data.priority ?? "medium", clientId: data.clientId ?? "u_client_1",
      managerId: data.managerId ?? "u_emp_1", teamMembers: data.teamMembers ?? [], company: "digiayudh",
      createdAt: now, updatedAt: now,
    }
    db.projects.unshift(project as any)
    log("created", "Project", project._id, data.title)
    return delay({ success: true, data: project })
  },
  updateProject(id: string, data: Record<string, unknown>) {
    const p = db.projects.find((x) => x._id === id)
    if (!p) return fail("Project not found", 404)
    Object.assign(p, data, { updatedAt: new Date() })
    log("updated", "Project", id)
    return delay({ success: true, data: p })
  },
  deleteProject(id: string) {
    const idx = db.projects.findIndex((x) => x._id === id)
    if (idx === -1) return fail("Project not found", 404)
    db.projects.splice(idx, 1)
    log("deleted", "Project", id)
    return delay({ success: true })
  },

  /* ---- Tasks ---- */
  getTasks(_company: string, projectId?: string) {
    const data = projectId ? db.tasks.filter((t) => t.projectId === projectId) : db.tasks
    return delay({ success: true, data })
  },
  createTask(data: Record<string, any>) {
    const now = new Date()
    const task = {
      _id: db.uid("t"), title: data.title, description: data.description ?? "",
      status: data.status ?? "todo", priority: data.priority ?? "medium",
      projectId: data.projectId, assignedTo: data.assignedTo ?? "u_emp_1",
      createdBy: currentUserId() ?? "u_emp_1", dueDate: data.dueDate ? new Date(data.dueDate) : now,
      company: "digiayudh", createdAt: now, updatedAt: now,
    }
    db.tasks.unshift(task as any)
    log("created", "Task", task._id, data.title)
    return delay({ success: true, data: task })
  },
  updateTask(id: string, data: Record<string, unknown>) {
    const t = db.tasks.find((x) => x._id === id)
    if (!t) return fail("Task not found", 404)
    Object.assign(t, data, { updatedAt: new Date() })
    return delay({ success: true, data: t })
  },
  deleteTask(id: string) {
    const idx = db.tasks.findIndex((x) => x._id === id)
    if (idx === -1) return fail("Task not found", 404)
    db.tasks.splice(idx, 1)
    return delay({ success: true })
  },

  /* ---- HR Employees ---- */
  getEmployees() {
    return delay({ success: true, data: db.employees })
  },
  createEmployee(data: Record<string, any>) {
    const now = new Date()
    const emp = { _id: db.uid("e"), userId: db.uid("u_emp"), isActive: true, company: "digiayudh", createdAt: now, updatedAt: now, joiningDate: now, ...data } as (typeof db.employees)[number]
    db.employees.unshift(emp)
    return delay({ success: true, data: emp })
  },
  updateEmployee(id: string, data: Record<string, unknown>) {
    const e = db.employees.find((x) => x._id === id)
    if (!e) return fail("Employee not found", 404)
    Object.assign(e, data, { updatedAt: new Date() })
    return delay({ success: true, data: e })
  },
  deleteEmployee(id: string) {
    const idx = db.employees.findIndex((x) => x._id === id)
    if (idx === -1) return fail("Employee not found", 404)
    db.employees.splice(idx, 1)
    return delay({ success: true })
  },

  /* ---- Leads ---- */
  getLeads() {
    return delay({ success: true, data: db.leads })
  },
  createLead(data: Record<string, any>) {
    const now = new Date()
    const lead = { _id: db.uid("l"), status: "new", company_id: "digiayudh", createdAt: now, updatedAt: now, ...data } as (typeof db.leads)[number]
    db.leads.unshift(lead)
    return delay({ success: true, data: lead })
  },
  updateLead(id: string, data: Record<string, unknown>) {
    const l = db.leads.find((x) => x._id === id)
    if (!l) return fail("Lead not found", 404)
    Object.assign(l, data, { updatedAt: new Date() })
    return delay({ success: true, data: l })
  },
  deleteLead(id: string) {
    const idx = db.leads.findIndex((x) => x._id === id)
    if (idx === -1) return fail("Lead not found", 404)
    db.leads.splice(idx, 1)
    return delay({ success: true })
  },

  /* ---- Chats & messages ---- */
  getChats() {
    return delay({ success: true, data: db.chats })
  },
  getMessages(chatId: string) {
    return delay({ success: true, data: db.messages.filter((m) => m.chatId === chatId) })
  },
  sendMessage(chatId: string, content: string) {
    const user = currentUser()
    const msg = {
      _id: db.uid("m"), senderId: user?._id ?? "u_emp_1", senderName: user?.name ?? "You",
      content, chatId, isRead: false, createdAt: new Date(),
    }
    db.messages.push(msg)
    const chat = db.chats.find((c) => c._id === chatId)
    if (chat) { chat.lastMessage = content; chat.lastMessageTime = new Date() }
    return delay({ success: true, data: msg })
  },
  createChat(data: Record<string, any>) {
    const now = new Date()
    const chat = { _id: db.uid("c"), participants: [], participantNames: [], isGroup: false, company: "digiayudh", createdAt: now, updatedAt: now, ...data }
    db.chats.unshift(chat)
    return delay({ success: true, data: chat })
  },

  /* ---- Notifications ---- */
  getNotifications(userId: string) {
    return delay({ success: true, data: db.notifications.filter((n) => n.userId === userId) })
  },
  markNotificationAsRead(id: string) {
    const n = db.notifications.find((x) => x._id === id)
    if (n) n.isRead = true
    return delay({ success: true })
  },
  markAllNotificationsRead(userId: string) {
    db.notifications.filter((n) => n.userId === userId).forEach((n) => (n.isRead = true))
    return delay({ success: true })
  },

  /* ---- Contact requests ---- */
  createContactRequest(data: Partial<ContactRequest>) {
    const now = new Date()
    const req: ContactRequest = {
      _id: db.uid("cr"), name: data.name!, email: data.email!, phone: data.phone,
      company: data.company, subject: data.subject!, message: data.message!,
      status: "new", createdAt: now, updatedAt: now,
    }
    db.contactRequests.unshift(req)
    db.notifications.unshift({
      _id: db.uid("n"), userId: "u_admin_1", title: "New contact request",
      message: `${req.name} submitted: "${req.subject}"`, type: "info", isRead: false,
      link: "/admin/contact-requests", createdAt: now,
    })
    return delay({ success: true, data: req })
  },
  getContactRequests() {
    return delay({ success: true, data: db.contactRequests })
  },
  updateContactRequest(id: string, data: Partial<ContactRequest>) {
    const r = db.contactRequests.find((x) => x._id === id)
    if (!r) return fail("Request not found", 404)
    Object.assign(r, data, { updatedAt: new Date() })
    return delay({ success: true, data: r })
  },

  /* ---- Invoices ---- */
  getInvoices(clientId?: string) {
    const data = clientId ? db.invoices.filter((i) => i.clientId === clientId) : db.invoices
    return delay({ success: true, data })
  },
  updateInvoice(id: string, data: Partial<Invoice>) {
    const inv = db.invoices.find((x) => x._id === id)
    if (!inv) return fail("Invoice not found", 404)
    Object.assign(inv, data)
    return delay({ success: true, data: inv })
  },

  /* ---- Meetings ---- */
  getMeetings(clientId?: string) {
    const data = clientId ? db.meetings.filter((m) => m.clientId === clientId) : db.meetings
    return delay({ success: true, data })
  },
  createMeeting(data: Partial<Meeting>) {
    const now = new Date()
    const meeting: Meeting = {
      _id: db.uid("mt"), title: data.title!, description: data.description,
      start: data.start ? new Date(data.start) : now, end: data.end ? new Date(data.end) : now,
      attendees: data.attendees ?? [], organizerId: currentUserId() ?? "u_emp_1",
      clientId: data.clientId, location: data.location, link: data.link,
      status: "scheduled", createdAt: now,
    }
    db.meetings.unshift(meeting)
    log("created", "Meeting", meeting._id, data.title)
    return delay({ success: true, data: meeting })
  },
  updateMeeting(id: string, data: Record<string, unknown>) {
    const m = db.meetings.find((x) => x._id === id)
    if (!m) return fail("Meeting not found", 404)
    Object.assign(m, data)
    log("updated", "Meeting", id)
    return delay({ success: true, data: m })
  },
  deleteMeeting(id: string) {
    const idx = db.meetings.findIndex((x) => x._id === id)
    if (idx === -1) return fail("Meeting not found", 404)
    const [removed] = db.meetings.splice(idx, 1)
    log("deleted", "Meeting", id, removed.title)
    return delay({ success: true })
  },

  /* ---- Documents ---- */
  getDocuments(ownerId?: string) {
    const data = ownerId ? db.documents.filter((d) => d.ownerId === ownerId) : db.documents
    return delay({ success: true, data })
  },

  /* ---- Support ---- */
  getSupportTickets(createdBy?: string) {
    const data = createdBy ? db.supportTickets.filter((t) => t.createdBy === createdBy) : db.supportTickets
    return delay({ success: true, data })
  },
  createSupportTicket(data: Partial<SupportTicket>) {
    const now = new Date()
    const user = currentUser()
    const ticket: SupportTicket = {
      _id: db.uid("s"), subject: data.subject!, description: data.description ?? "",
      priority: data.priority ?? "medium", status: "open", category: data.category ?? "General",
      createdBy: user?._id ?? "u_client_1", createdByName: user?.name ?? "Client",
      replies: [], createdAt: now, updatedAt: now,
    }
    db.supportTickets.unshift(ticket)
    return delay({ success: true, data: ticket })
  },
  replySupportTicket(id: string, message: string) {
    const t = db.supportTickets.find((x) => x._id === id)
    if (!t) return fail("Ticket not found", 404)
    const user = currentUser()
    t.replies.push({ authorId: user?._id ?? "", authorName: user?.name ?? "You", message, createdAt: new Date() })
    t.updatedAt = new Date()
    return delay({ success: true, data: t })
  },
  updateSupportTicket(id: string, data: Partial<SupportTicket>) {
    const t = db.supportTickets.find((x) => x._id === id)
    if (!t) return fail("Ticket not found", 404)
    Object.assign(t, data, { updatedAt: new Date() })
    return delay({ success: true, data: t })
  },

  /* ---- Audit logs ---- */
  getAuditLogs() {
    return delay({ success: true, data: db.auditLogs })
  },


  /* ---- Dashboard aggregates ---- */
  getDashboardStats(role: string): Promise<{ data: { success: boolean; data: DashboardStat[] } }> {
    const activeProjects = db.projects.filter((p) => p.status === "active").length
    const revenue = db.invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0)
    const pendingClients = db.users.filter((u) => u.role === "client" && u.verificationStatus === "pending").length
    const openTickets = db.supportTickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length
    const completedTasks = db.tasks.filter((t) => t.status === "completed").length

    let stats: DashboardStat[] = []
    if (role === "admin") {
      stats = [
        { label: "Total Clients", value: db.users.filter((u) => u.role === "client").length, change: 12, trend: "up" },
        { label: "Active Projects", value: activeProjects, change: 8, trend: "up" },
        { label: "Revenue", value: revenue, change: 15, trend: "up", format: "currency" },
        { label: "Pending Verifications", value: pendingClients, change: 2, trend: "up" },
      ]
    } else if (role === "employee") {
      stats = [
        { label: "My Projects", value: activeProjects, change: 5, trend: "up" },
        { label: "Open Tasks", value: db.tasks.filter((t) => t.status !== "completed").length, change: -3, trend: "down" },
        { label: "Completed Tasks", value: completedTasks, change: 10, trend: "up" },
        { label: "Assigned Clients", value: db.users.filter((u) => u.assignedEmployeeId === (currentUserId() ?? "u_emp_1")).length, change: 1, trend: "up" },
      ]
    } else {
      const myInvoices = db.invoices.filter((i) => i.clientId === (currentUserId() ?? "u_client_1"))
      stats = [
        { label: "Active Projects", value: activeProjects, change: 4, trend: "up" },
        { label: "Open Tickets", value: openTickets, change: 1, trend: "up" },
        { label: "Outstanding", value: myInvoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.total, 0), change: -5, trend: "down", format: "currency" },
        { label: "Documents", value: db.documents.length, change: 3, trend: "up" },
      ]
    }
    return delay({ success: true, data: stats })
  },

  // Attendance
  getAttendance() {
    return delay({ success: true, data: db.attendance || [] })
  },
  markAttendance(data: any) {
    if (!db.attendance) db.attendance = []
    const existing = db.attendance.find((a: any) => a.employeeId === data.employeeId && a.date === data.date)
    if (existing) {
      Object.assign(existing, data)
      return delay({ success: true, data: existing })
    }
    const newAttendance = { _id: db.uid("att"), ...data }
    db.attendance.push(newAttendance)
    return delay({ success: true, data: newAttendance })
  },

  // Leave Requests
  getLeaveRequests(company: string) {
    return delay({ success: true, data: db.leaveRequests || [] })
  },
  createLeaveRequest(data: any) {
    if (!db.leaveRequests) db.leaveRequests = []
    const newLeave = { _id: db.uid("leave"), ...data }
    db.leaveRequests.push(newLeave)
    return delay({ success: true, data: newLeave })
  },
  approveLeaveRequest(id: string, approvedBy: string) {
    if (!db.leaveRequests) return fail("Leave request not found", 404)
    const leave = db.leaveRequests.find((l: any) => l._id === id)
    if (!leave) return fail("Leave request not found", 404)
    leave.status = "approved"
    leave.approvedBy = approvedBy
    return delay({ success: true, data: leave })
  },
  rejectLeaveRequest(id: string, reason: string) {
    if (!db.leaveRequests) return fail("Leave request not found", 404)
    const leave = db.leaveRequests.find((l: any) => l._id === id)
    if (!leave) return fail("Leave request not found", 404)
    leave.status = "rejected"
    leave.rejectionReason = reason
    return delay({ success: true, data: leave })
  },

  // To-Do Lists
  getToDos(employeeId: string) {
    if (!db.todos) db.todos = []
    const todos = db.todos.filter((t: any) => t.employeeId === employeeId)
    return delay({ success: true, data: todos })
  },
  createToDo(data: any) {
    if (!db.todos) db.todos = []
    const newTodo = { _id: db.uid("todo"), ...data, createdAt: new Date(), updatedAt: new Date() }
    db.todos.push(newTodo)
    return delay({ success: true, data: newTodo })
  },
  updateToDo(id: string, data: any) {
    if (!db.todos) return fail("To-Do not found", 404)
    const todo = db.todos.find((t: any) => t._id === id)
    if (!todo) return fail("To-Do not found", 404)
    Object.assign(todo, { ...data, updatedAt: new Date() })
    return delay({ success: true, data: todo })
  },
  deleteToDo(id: string) {
    if (!db.todos) return fail("To-Do not found", 404)
    const idx = db.todos.findIndex((t: any) => t._id === id)
    if (idx === -1) return fail("To-Do not found", 404)
    db.todos.splice(idx, 1)
    return delay({ success: true })
  },
}

export type MockApi = typeof mockApi
