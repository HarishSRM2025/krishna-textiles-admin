'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Sparkles, ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@krishnatextiles.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.auth.login(email, password);
      if (res?.accessToken) {
        localStorage.setItem('kt_admin_token', res.accessToken);
        localStorage.setItem('kt_admin_user', JSON.stringify(res.user));
        localStorage.setItem('kt_admin_session', JSON.stringify(res.session));
        router.push('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@krishnatextiles.com');
      setPassword('admin123');
    } else {
      setEmail('manager@krishnatextiles.com');
      setPassword('manager123');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#06090E] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-dark-900/90 border border-dark-700/80 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Krishna Textiles</h2>
          <p className="text-xs text-slate-400 mt-1">Enterprise ERP & Operations Control Center</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">Official Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@krishnatextiles.com"
                className="w-full pl-10 pr-4 py-3 bg-dark-950 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-dark-950 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating Session...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Autofill */}
        <div className="mt-8 pt-6 border-t border-dark-700/60">
          <p className="text-[11px] text-slate-500 text-center uppercase tracking-wider font-semibold mb-3">
            Quick Demo Autofill
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => fillCredentials('admin')}
              className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 text-slate-300 font-semibold transition-colors"
            >
              Super Admin
            </button>
            <button
              onClick={() => fillCredentials('manager')}
              className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 text-slate-300 font-semibold transition-colors"
            >
              Staff Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
