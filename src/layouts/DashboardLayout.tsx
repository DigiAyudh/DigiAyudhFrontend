import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { useAppSelector } from '../redux/hooks'
import type { UserRole } from '../types'

export default function DashboardLayout({ role }: { role: UserRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = useAppSelector((s) => s.auth.user)
  const effectiveRole = (user?.role as UserRole) || role

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar role={effectiveRole} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
