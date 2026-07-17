import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './redux/store'
import { ThemeProvider } from './lib/theme'
import AuthInitializer from './components/AuthInitializer'
import PrivateRoute from './components/PrivateRoute'
import DashboardLayout from './layouts/DashboardLayout'

// Public pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import PendingVerification from './pages/PendingVerification'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PublicCertificateVerification from './pages/PublicCertificateVerification'
import NotFound from './pages/NotFoundPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import EmployeesPage from './pages/admin/EmployeesPage'
import AdminsPage from './pages/admin/AdminsPage'
import ClientsPage from './pages/admin/ClientsPage'
import VerificationPage from './pages/admin/VerificationPage'
import ContactRequestsPage from './pages/admin/ContactRequestsPage'
import AuditLogsPage from './pages/admin/AuditLogsPage'
import AdminMeetingsPage from './pages/admin/AdminMeetingsPage'
import AdminTasksPage from './pages/admin/AdminTasksPage'
import AdminAttendancePage from './pages/admin/AttendancePage'
import AdminLeaveRequestsPage from './pages/admin/LeaveRequestsPage'
import CertificatesPage from './pages/admin/CertificatesPage'
import InternalDocumentationPage from './pages/shared/InternalDocumentationPage'

// Employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import LeadsPage from './pages/employee/LeadsPage'
import AttendancePage from './pages/employee/AttendancePage'
import MyClientsPage from './pages/employee/MyClientsPage'
import MyTasksPage from './pages/employee/MyTasksPage'

// Client pages
import ClientDashboard from './pages/client/ClientDashboard'

// Shared pages
import ProjectsPage from './pages/shared/ProjectsPage'
import ProjectDetail from './pages/shared/ProjectDetail'
import TaskBoard from './pages/shared/TaskBoard'
import MeetingsPage from './pages/shared/MeetingsPage'
import InvoicesPage from './pages/shared/InvoicesPage'
import DocumentsPage from './pages/shared/DocumentsPage'
import SupportPage from './pages/shared/SupportPage'
import MessagesPage from './pages/shared/MessagesPage'
import ProfilePage from './pages/shared/ProfilePage'
import SettingsPage from './pages/shared/SettingsPage'
import NotificationsPage from './pages/shared/NotificationsPage'

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthInitializer>
          <Router>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/pending-verification" element={<PendingVerification />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify/cert/:token" element={<PublicCertificateVerification />} />

              {/* Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRole="admin">
                    <DashboardLayout role="admin" />
                  </PrivateRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="admins" element={<AdminsPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="verification" element={<VerificationPage />} />
                <Route path="projects" element={<ProjectsPage basePath="/admin/projects" />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="tasks" element={<AdminTasksPage />} />
                <Route path="attendance" element={<AdminAttendancePage />} />
                <Route path="leave-requests" element={<AdminLeaveRequestsPage />} />
                <Route path="contact-requests" element={<ContactRequestsPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                <Route path="certificates" element={<CertificatesPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="internal-docs" element={<InternalDocumentationPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="meetings" element={<AdminMeetingsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Employee Dashboard */}
              <Route
                path="/employee"
                element={
                  <PrivateRoute requiredRole="employee">
                    <DashboardLayout role="employee" />
                  </PrivateRoute>
                }
              >
                <Route index element={<EmployeeDashboard />} />
                <Route path="projects" element={<ProjectsPage basePath="/employee/projects" />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="tasks" element={<TaskBoard />} />
                <Route path="my-tasks" element={<MyTasksPage />} />
                <Route path="clients" element={<MyClientsPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="calendar" element={<MeetingsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="internal-docs" element={<InternalDocumentationPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Client Dashboard */}
              <Route
                path="/client"
                element={
                  <PrivateRoute requiredRole="client">
                    <DashboardLayout role="client" />
                  </PrivateRoute>
                }
              >
                <Route index element={<ClientDashboard />} />
                <Route path="projects" element={<ProjectsPage basePath="/client/projects" />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="meetings" element={<MeetingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'hsl(var(--surface))',
                color: 'hsl(var(--text))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </AuthInitializer>
      </ThemeProvider>
    </Provider>
  )
}

export default App
