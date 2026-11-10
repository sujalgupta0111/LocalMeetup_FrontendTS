import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { authApi } from '../../api/auth';
import { MessageSquare, Lock, User, Mail, ArrowRight, Loader2 } from 'lucide-react';

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username too long')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setServerError('');
    try {
      const data = await authApi.register({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        password: values.password,
      });
      dispatch(setCredentials(data));
      navigate('/');
    } catch (err: any) {
      setServerError(
        err?.response?.data?.error || 'Registration failed. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 select-none">
      <div className="w-full max-w-md bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 mb-3">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-xs text-slate-400 mt-1">
            Join ChatSphere and chat in real-time
          </p>
        </div>

        {serverError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                First Name
              </label>
              <input
                {...register('firstName')}
                type="text"
                placeholder="John"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
              {errors.firstName && (
                <p className="text-[11px] text-rose-400 mt-0.5">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Last Name
              </label>
              <input
                {...register('lastName')}
                type="text"
                placeholder="Doe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
              {errors.lastName && (
                <p className="text-[11px] text-rose-400 mt-0.5">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                {...register('username')}
                type="text"
                placeholder="johndoe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            {errors.username && (
              <p className="text-[11px] text-rose-400 mt-0.5">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-400 mt-0.5">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-400 mt-0.5">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-400 mt-0.5">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-primary-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-400 hover:text-primary-300 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
