'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Heart, Loader2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { LoginData } from '@/lib/api';
import { cn } from '@/lib/utils';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await login(data);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err);
      
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0]);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12">
          <div className="max-w-md text-center">
            <div className="flex items-center justify-center mb-8">
              <Heart className="h-12 w-12 text-pink-400 mr-3" />
              <h1 className="text-4xl font-bold text-white">VIPConnect</h1>
            </div>
            <p className="text-xl text-purple-200 mb-8">
              Connect with your favorite creators and discover exclusive content
            </p>
            <div className="space-y-4 text-purple-300">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                <span>Premium content from verified creators</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                <span>Direct messaging and live interactions</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                <span>Secure payments and privacy protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-purple-200">Sign in to your VIPConnect account</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className={cn(
                      'w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-purple-300',
                      'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent',
                      'transition-all duration-200',
                      errors.email ? 'border-red-400' : 'border-white/20'
                    )}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-300">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className={cn(
                        'w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-purple-300 pr-12',
                        'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent',
                        'transition-all duration-200',
                        errors.password ? 'border-red-400' : 'border-white/20'
                      )}
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-300">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      {...register('rememberMe')}
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-pink-400 focus:ring-pink-400 focus:ring-2"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm text-purple-200">Remember me</span>
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600',
                    'text-white font-semibold rounded-lg shadow-lg',
                    'hover:from-pink-600 hover:to-purple-700 transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'flex items-center justify-center'
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-purple-200">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/register"
                    className="text-pink-400 hover:text-pink-300 font-semibold transition-colors"
                  >
                    Sign up now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}