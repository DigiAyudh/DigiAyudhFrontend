import { useNavigate } from 'react-router-dom'
import { Clock, ShieldCheck, XCircle, LogOut, Mail } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { logout } from '../redux/slices/authSlice'
import { Button } from '../components/ui/button'
import { ThemeToggle } from '../components/common/ThemeToggle'

export default function PendingVerification() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((s) => s.auth)
  const rejected = user?.verificationStatus === 'rejected'

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-lg font-bold">DigiAyudh</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-10 text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              rejected ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
            }`}
          >
            {rejected ? <XCircle className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            {rejected ? 'Account not approved' : 'Verification pending'}
          </h1>

          {rejected ? (
            <p className="mt-3 text-pretty text-text-muted">
              Unfortunately your account request was not approved.
              {user?.rejectionReason ? ` Reason: ${user.rejectionReason}` : ''} Please contact our team for
              more information.
            </p>
          ) : (
            <p className="mt-3 text-pretty text-text-muted">
              Thanks for signing up, {user?.name?.split(' ')[0] || 'there'}! Your account is being reviewed by
              our team. You&apos;ll get full access as soon as an administrator verifies your details.
            </p>
          )}

          <div className="mt-8 space-y-3 rounded-xl border border-border bg-background p-5 text-left">
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-text-muted">
                Verification usually completes within 1 business day.
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-text-muted">
                We&apos;ll notify {user?.email} once your account is active.
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button variant="outline" onClick={handleLogout}>
              Sign out
            </Button>
            <Button onClick={() => window.location.reload()}>Check status</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
