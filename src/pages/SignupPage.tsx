import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
// import { clientSignup } from '../../../redux/slices/authSlice'
import { sendEmailOtp } from '@/redux/slices/authSlice'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'




import 'react-phone-input-2/lib/style.css'
import { useForm, Controller } from 'react-hook-form'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import '../index.css'



const schema = z
  .object({
    name: z.string().min(2, 'Full name is required'),
    companyName: z.string().min(2, 'Company name is required'),
    email: z.string().email('Enter a valid email'),
    countryCode: z.string().min(1, 'Required'),
    phone: z.string().min(6, 'Enter a valid phone number'),
    companyType: z.string().min(1, 'Select a company type'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    password: z.string().min(6, 'Minimum 6 characters'),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((v) => v === true, {
      message: 'You must accept the terms',
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

const companyTypes = ['Startup', 'SMB', 'Enterprise', 'Agency', 'Non-profit', 'Other']

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function SignupPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading } = useAppSelector((s) => s.auth)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      countryCode: '+91',
      phone: '',
      country: 'India',
    },
  })

  // const onSubmit = async (values: FormValues) => {
  //   const result = await dispatch(clientSignup(values))
  //   if (clientSignup.fulfilled.match(result)) {
  //     toast.success('Account created! Your account is pending verification.')
  //     navigate('/client')
  //   } else {
  //     toast.error((result.payload as string) || 'Signup failed')
  //   }
  // }

  const onSubmit = async (values: FormValues) => {
    const result = await dispatch(sendEmailOtp(values.email))

    if (sendEmailOtp.fulfilled.match(result)) {
      toast.success('Verification code sent to your email.')

      navigate('/verify-email', {
        state: {
          email: values.email,
          signupData: values,
        },
      })
    } else {
      toast.error((result.payload as string) || 'Failed to send OTP')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -right-40 -top-40 size-[500px] rounded-full bg-purple-600/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[500px] rounded-full bg-blue-600/5 blur-3xl" />

      <div className="relative w-full max-w-2xl">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20">
              <img
                src="/digiayudh-logo.jpeg"
                alt="DigiAyudh Logo"
                className="h-8 w-8 rounded-lg object-cover"
              />
            </div>
          </Link>

          <CardHeader className="text-center">
            <CardTitle className="text-3xl">
              Welcome to DigiAyudh
            </CardTitle>

            <CardDescription>
              Create your client account
            </CardDescription>
          </CardHeader>
        </div>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.name?.message}>
                  <Input placeholder="Jane Doe" {...register('name')} />
                </Field>
                <Field label="Company name" error={errors.companyName?.message}>
                  <Input placeholder="Acme Inc." {...register('companyName')} />
                </Field>
              </div>

              <Field label="Work email" error={errors.email?.message}>
                <Input type="email" placeholder="you@company.com" {...register('email')} />
              </Field>

              <Field label="Phone Number" error={errors.phone?.message}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      country="in"
                      enableSearch
                      value={field.value}
                      onChange={(value, country) => {
                        field.onChange(value)

                        if (country && typeof country !== 'string') {
                          setValue('countryCode', `+${country.dialCode}`)
                        }
                      }}
                    />
                  )}
                />
              </Field>

              <input type="hidden" {...register('countryCode')} />

              <Field label="Company type" error={errors.companyType?.message}>
                <select
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue=""
                  {...register('companyType')}
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  {companyTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" error={errors.city?.message}>
                  <Input placeholder="Indor" {...register('city')} />
                </Field>
                <Field label="State" error={errors.state?.message}>
                  <Input placeholder="MP" {...register('state')} />
                </Field>
                <Field label="Country" error={errors.country?.message}>
                  <Input placeholder="India" {...register('country')} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Password" error={errors.password?.message}>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm password" error={errors.confirmPassword?.message}>
                  <Input type="password" placeholder="••••••••" {...register('confirmPassword')} />
                </Field>
              </div>

              <label className="flex items-start gap-2 text-sm text-text-muted">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-border" {...register('termsAccepted')} />
                <span>
                  I agree to the{' '}
                  <span className="text-primary">Terms of Service</span> and{' '}
                  <span className="text-primary">Privacy Policy</span>.
                </span>
              </label>
              {errors.termsAccepted && <p className="text-xs text-destructive">{errors.termsAccepted.message}</p>}

              <Button type="submit" className="w-full" Loading={loading}>
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>

  )
}
