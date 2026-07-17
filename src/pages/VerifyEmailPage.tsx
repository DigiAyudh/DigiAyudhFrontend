import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { APP_CONFIG } from '@/config/navigation'
import { useAppDispatch } from '@/redux/hooks'
import { verifyEmailOtp } from '@/redux/slices/authSlice'
import { Mail, ArrowLeft } from 'lucide-react'

const schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
})

type VerifyFormData = z.infer<typeof schema>

export default function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  const email = location.state?.email
  const signupData = location.state?.signupData

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(schema),
  })

  // Redirect to signup if email not provided
  useEffect(() => {
    if (!email) {
      navigate('/signup')
    }
  }, [email, navigate])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const onSubmit = async (data: VerifyFormData) => {
    try {
      setIsLoading(true)
      const result = await dispatch(
        verifyEmailOtp({
          email: email || '',
          otp: data.otp,
        })
      ).unwrap()

      toast.success('Email verified successfully!')
      // Store signup data for next step or auto-login
      if (signupData) {
        navigate('/client', { state: { signupData } })
      } else {
        navigate('/client')
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to verify OTP. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    try {
      // Call resend OTP API
      toast.success('OTP resent to your email')
      setTimeLeft(300)
    } catch (error) {
      toast.error('Failed to resend OTP')
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute left-1/2 top-0 size-[500px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8">
          <Link to="/signup" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to signup
          </Link>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  {...register('otp')}
                />
                {errors.otp && <p className="text-xs text-destructive">{errors.otp.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || timeLeft === 0}>
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>

              <div className="space-y-3">
                <p className="text-center text-sm text-muted-foreground">
                  Code expires in <span className="font-semibold text-foreground">{formatTime(timeLeft)}</span>
                </p>

                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={timeLeft > 240}
                  className="w-full text-center text-sm text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {timeLeft > 240 ? `Resend code in ${formatTime(timeLeft - 240)}` : 'Resend code'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
