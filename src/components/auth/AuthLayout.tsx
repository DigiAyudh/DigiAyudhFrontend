import { Link } from 'react-router-dom'
import { Layers, Check } from 'lucide-react'
import type { ReactNode } from 'react'

const highlights = [
  'Role-based dashboards for admins, employees & clients',
  'Projects, CRM, invoicing & analytics in one platform',
  'Enterprise-grade security and audit trails',
]

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>
        <Link to="/" className="relative flex items-center gap-2 text-primary-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">DigiAyudh</span>
        </Link>

        <div className="relative">
          <h2 className="text-balance text-3xl font-bold text-primary-foreground">
            The all-in-one platform to run your business.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-primary-foreground/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm leading-relaxed">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/70">
          &copy; {new Date().getFullYear()} DigiAyudh. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">DigiAyudh</span>
          </Link>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
