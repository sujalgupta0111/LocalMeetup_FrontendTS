import React, { useState } from 'react';
import   { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { authApi } from '../../api/auth';
import { MessageSquare, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Please enter your username or email'),
  password: z.string().min(1, 'Please enter your password'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setServerError('');
    try {
      const data = await authApi.login(values);
      dispatch(setCredentials(data));
      navigate('/');
    } catch (err: any) {
      setServerError(
        err?.response?.data?.error || 'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (email: string) => {
    setValue('identifier', email);
    setValue('password', 'Password123!');
    onSubmit({ identifier: email, password: 'Password123!' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 select-none">
      <div className="w-full max-w-md bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* App Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 mb-3">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to ChatSphere</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time messaging with instant WebSocket delivery
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="mb-6 p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center space-x-1.5 text-xs text-amber-300 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Accounts (Click to test):</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('alice@chatsphere.io')}
              className="px-2.5 py-1.5 rounded-xl bg-primary-600/30 hover:bg-primary-600/50 border border-primary-500/30 text-xs font-medium text-white transition text-center truncate"
            >
              👩 Alice
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('bob@chatsphere.io')}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-xs font-medium text-white transition text-center truncate"
            >
              👨 Bob
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('charlie@chatsphere.io')}
              className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-xs font-medium text-white transition text-center truncate"
            >
              🧑 Charlie
            </button>
          </div>
        </div>

        {serverError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                {...register('identifier')}
                type="text"
                placeholder="alice or alice@chatsphere.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            {errors.identifier && (
              <p className="text-xs text-rose-400 mt-1">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary-400 hover:text-primary-300 transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-primary-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-400 hover:text-primary-300 transition"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
