import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import apiClient from '@/services/api'
import type { ApiError } from '@/types'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      await apiClient.requestPasswordReset(data.email)
      setSubmittedEmail(data.email)
      setIsSubmitted(true)
      toast.success('Password reset link sent to your email')
    } catch (err) {
      const error = err as ApiError
      toast.error(error.message ?? 'Failed to send reset link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -right-40 -top-40 size-[500px] rounded-full bg-purple-600/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[500px] rounded-full bg-blue-600/5 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        {!isSubmitted ? (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-foreground">Forgot password?</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="space-y-1 pb-5">
                <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground">
                  Password Recovery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        className="pl-10"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="rounded-lg bg-muted/50 border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll send you an email with a secure link to reset your password. The link will expire in 24 hours.
                    </p>
                  </div>

                  <Button variant="brand" className="w-full h-11" type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <div className="relative flex items-center gap-2">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 border-t border-border" />
                  </div>

                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full h-11">
                      Return to login
                    </Button>
                  </Link>
                </form>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="mb-10 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100/20 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{submittedEmail}</span>
              </p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">Next steps:</p>
                        <ul className="space-y-1 text-xs list-disc list-inside opacity-90">
                          <li>Check your email inbox and spam folder</li>
                          <li>Click the reset link in the email</li>
                          <li>Enter your new password</li>
                          <li>Sign in with your new password</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => {
                      setIsSubmitted(false)
                    }}
                  >
                    Try another email
                  </Button>

                  <Link to="/login" className="block">
                    <Button variant="brand" className="w-full h-11">
                      Back to login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/" className="text-primary hover:text-primary-dark transition-colors">
            Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}
