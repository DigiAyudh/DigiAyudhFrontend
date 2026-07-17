import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowUpRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { APP_CONFIG } from '@/config/navigation';
import { useAuth } from '@/contexts/auth.context';
import type { ApiError } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  const remember = watch('remember');

  // const onSubmit = async (data: LoginFormData) => {
  //   try {
  //     const roleMap: Record<string, any> = {
  //       'client@digiayudh.com': 'client',
  //       'employee@digiayudh.com': 'employee',
  //       'admin@digiayudh.com': 'admin',
  //       'superadmin@digiayudh.com': 'admin',
  //     };
  //     const role = roleMap[data.email] || 'client';
  //     await login(data.email, data.password, role as any);
  //     toast.success('Welcome back!');
  //     const dashboardRoutes: Record<string, string> = {
  //       admin: '/admin',
  //       employee: '/employee',
  //       client: '/client',
  //     };
  //     navigate(dashboardRoutes[role] || '/client');
  //   } catch (err) {
  //     const error = err as ApiError;
  //     toast.error(error.message ?? 'Login failed');
  //   }
  // };

  const onSubmit = async (data: LoginFormData) => {
  try {
    const user = await login(data.email, data.password); // no role param
    toast.success('Welcome back!');

    const dashboardRoutes: Record<string, string> = {
      admin: '/admin',
      employee: '/employee',
      client: '/client',
    };
    navigate(dashboardRoutes[user.role] || '/client'); // ✅ actual role se
  } catch (err) {
    const error = err as ApiError;
    toast.error(error.message ?? 'Login failed');
  }
};

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -right-40 -top-40 size-[500px] rounded-full bg-purple-600/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[500px] rounded-full bg-blue-600/5 blur-3xl" />
      <div className="relative w-full max-w-md">
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
          <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your DigiAyudh account</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1 pb-5">
            <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground">Login</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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

              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-dark transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button variant="brand" className="w-full h-11" type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              <div className="relative flex items-center gap-2">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <Link to="/signup" className="block">
                <Button variant="outline" className="w-full h-11">
                  Create account
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/" className="text-primary hover:text-primary-dark transition-colors">
            Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
