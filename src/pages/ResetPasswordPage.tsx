import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import apiClient from '@/services/api'
import type { ApiError } from '@/types'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain an uppercase letter').regex(/[0-9]/, 'Password must contain a number').regex(/[^a-zA-Z0-9]/, 'Password must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('Invalid or missing reset token')
        setIsVerifying(false)
        return
      }

      try {
        await apiClient.verifyPasswordResetToken(token)
        setIsValid(true)
        setIsVerifying(false)
      } catch (err) {
        const error = err as ApiError
        toast.error(error.message ?? 'This reset link is invalid or has expired')
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    setIsLoading(true)
    try {
      await apiClient.resetPassword(token, data.password)
      setIsSuccess(true)
      toast.success('Password reset successfully')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      const error = err as ApiError
      toast.error(error.message ?? 'Failed to reset password')
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
        {isVerifying && (
          <>
            <div className="mb-10 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              <h1 className="mt-4 text-2xl font-bold text-foreground">Verifying...</h1>
              <p className="mt-2 text-sm text-muted-foreground">Please wait while we verify your reset link</p>
            </div>
          </>
        )}

        {!isVerifying && !isValid && (
          <>
            <div className="mb-10 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100/20 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Link expired</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardContent className="pt-6">
                <Link to="/forgot-password" className="block">
                  <Button variant="brand" className="w-full h-11">
                    Request new reset link
                  </Button>
                </Link>
                <Link to="/login" className="block mt-3">
                  <Button variant="outline" className="w-full h-11">
                    Back to login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        {!isVerifying && isValid && !isSuccess && (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-foreground">Create new password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter a strong password to secure your account
              </p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="space-y-1 pb-5">
                <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground">
                  Reset Password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="rounded-lg bg-muted/50 border border-border p-3">
                    <p className="text-xs text-muted-foreground font-medium mb-2">Password requirements:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter</li>
                      <li>One number</li>
                      <li>One special character</li>
                    </ul>
                  </div>

                  <Button variant="brand" className="w-full h-11" type="submit" disabled={isLoading}>
                    {isLoading ? 'Resetting password...' : 'Reset Password'}
                  </Button>

                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full h-11">
                      Back to login
                    </Button>
                  </Link>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {isSuccess && (
          <>
            <div className="mb-10 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100/20 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Password reset successful</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your password has been reset. You&apos;ll be redirected to the login page shortly.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
