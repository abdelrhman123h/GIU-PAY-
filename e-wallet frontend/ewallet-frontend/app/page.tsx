'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3333';

type AlertType = 'success' | 'error';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState<{ message: string; type: AlertType } | null>(null);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const showAlert = (message: string, type: AlertType) => {
    setAlert({ message, type });
  };

  const handleAuth = async () => {
    if (!email || !password) {
      showAlert('⚠️ Please enter email and password', 'error');
      return;
    }

    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        showAlert('✅ Login successful! Redirecting...', 'success');
        setTimeout(() => router.push('/wallet'), 1000);
      } else {
        const payload = { email, password, role: 'student' };
        await axios.post(`${API_BASE_URL}/auth/register`, payload);
        showAlert('✅ Registered successfully! Please login.', 'success');
        setIsLogin(true);
      }
    } catch (err: any) {
      showAlert(`❌ ${err.response?.data?.message || 'Authentication failed'}`, 'error');
    }
  };

  return (
    <div className="page-background relative min-h-screen flex items-center justify-center p-4">
      <div className="unified-card max-w-md w-full">
        {/* GIU Logo */}
        <div className="flex justify-center mt-6 mb-2">
          <div className="w-48 h-48 flex items-center justify-center">
            <svg width="180" height="100" viewBox="0 0 164 80" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 40C0 18 18 0 40 0C50 0 58 4 64 10L58 18C54 14 48 12 40 12C26 12 14 26 14 40C14 54 26 68 40 68C48 68 54 66 58 62V50H44V38H72V70C66 76 52 80 40 80C18 80 0 62 0 40Z" fill="#000000" />
              <rect x="80" y="0" width="12" height="80" fill="#DC2626" />
              <path d="M100 0V50C100 66 116 80 132 80C148 80 164 66 164 50V0H152V50C152 58 146 68 132 68C118 68 112 58 112 50V0H100Z" fill="#D97706" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            GIU PAY
          </h1>
          <p className="text-slate-400 text-lg font-medium">
            {isLogin ? 'Sign in to access your digital wallet' : 'Create your secure university wallet'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="University ID / Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 transition-all duration-300 text-lg"
                autoComplete="email"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">📧</div>
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 transition-all duration-300 text-lg"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">🔒</div>
            </div>
          </div>

          <button
            onClick={handleAuth}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">
              {isLogin ? '🚀 Sign In' : '✨ Create Account'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        </div>

        <div className="text-center mt-8 pt-6 border-t border-white/10">
          <p className="text-slate-400 mb-3">{isLogin ? "Don't have an account?" : 'Already registered?'}</p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-transparent bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text font-semibold hover:from-blue-300 hover:to-amber-300 transition-all duration-300 text-lg"
          >
            {isLogin ? '🆕 Create New Account' : '🔑 Sign In Instead'}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-2 text-slate-500 text-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span>Secured by GIU Authentication</span>
          <div className="text-green-400">🛡️</div>
        </div>
      </div>

      {/* Toast Alert */}
      <div
        aria-live="assertive"
        className={`fixed top-5 right-5 z-50 flex flex-col space-y-2 max-w-xs w-full pointer-events-auto ${
          alert ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        } transform transition-all duration-300`}
      >
        {alert && (
          <div
            className={`${
              alert.type === 'success' ? 'bg-green-500' : 'bg-red-600'
            } text-white rounded-lg shadow-lg p-4 flex items-center justify-between space-x-4`}
            role="alert"
          >
            <span className="text-base select-none">{alert.message}</span>
            <button
              aria-label="Close notification"
              onClick={() => setAlert(null)}
              className="text-white hover:text-slate-200 text-xl font-bold leading-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 active:bg-transparent focus:bg-transparent"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
