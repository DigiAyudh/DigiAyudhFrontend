import { useEffect, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  verifyEmailOtp,
  resendEmailOtp,
  clientSignup,
} from '@/redux/slices/authSlice'

export default function OtpVerificationPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { state } = useLocation()

  const { loading } = useAppSelector((s) => s.auth)

  const email = state?.email
  const signupData = state?.signupData

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [seconds, setSeconds] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email || !signupData) {
      navigate('/signup')
    }
  }, [email, signupData, navigate])

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setInterval(() => setSeconds(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [seconds])

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim().slice(0, 6)
    if (!/^\d+$/.test(pasted)) return

    const newOtp = [...pasted.split(''), ...Array(6 - pasted.length).fill('')]
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) return toast.error('Please enter 6 digit OTP')

    // ... rest of your verify logic (same as before)
    const verify = await dispatch(verifyEmailOtp({ email, otp: otpString }))
    if (!verifyEmailOtp.fulfilled.match(verify)) {
      return toast.error('Invalid OTP')
    }

    const signup = await dispatch(clientSignup(signupData))
    if (clientSignup.fulfilled.match(signup)) {
      toast.success('Account Created Successfully!')
      navigate('/login')
    } else {
      toast.error('Signup failed')
    }
  }

  const handleResend = async () => {
    const result = await dispatch(resendEmailOtp(email))
    if (resendEmailOtp.fulfilled.match(result)) {
      toast.success('OTP sent again')
      setSeconds(60)
      setOtp(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } else {
      toast.error('Failed to resend OTP')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 
                    bg-gradient-to-br from-zinc-50 to-zinc-100 
                    dark:from-zinc-950 dark:to-zinc-900">

      <Card className="w-full max-w-md shadow-2xl dark:shadow-zinc-950/50 border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="space-y-6 text-center">
          <img
            src="/DigiAyudhlogo.jpeg"
            alt="logo"
            className="mx-auto h-16 w-16 rounded-2xl shadow-sm"
          />

          <div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-base mt-3">
              We've sent a 6-digit code to
            </CardDescription>
          </div>

          <p className="font-semibold text-lg text-primary break-all">
            {email}
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* OTP Boxes */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-3xl font-semibold 
                         bg-white dark:bg-zinc-900 
                         border-2 border-zinc-200 dark:border-zinc-700 
                         focus:border-primary focus:ring-2 focus:ring-primary/20 
                         rounded-2xl transition-all duration-200 outline-none"
              />
            ))}
          </div>

          <Button
            className="w-full h-12 text-base font-medium"
            onClick={handleVerify}
            disabled={loading}
            isLoading={loading}
          >
            Verify Email
          </Button>

          {/* Resend */}
          <div className="text-center">
            {seconds > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend OTP in <span className="font-medium text-primary">{seconds}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Resend OTP
              </button>
            )}
          </div>

          <div className="text-center">
            <Link
              to="/signup"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Signup
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}