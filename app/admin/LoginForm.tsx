'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setStatus('error');
      setErrorMsg('Please enter a valid email.');
      return;
    }
    if (!password) {
      setStatus('error');
      setErrorMsg('Please enter your password.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const authRes = await fetch('/api/admin/request-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      if (!authRes.ok) {
        setStatus('error');
        setErrorMsg('Something went wrong. Try again later.');
        return;
      }

      const authData = (await authRes.json()) as { authorized?: boolean };
      if (!authData.authorized) {
        setStatus('error');
        setErrorMsg('Invalid email or password.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setStatus('error');
        setErrorMsg('Invalid email or password.');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Check your connection and try again.');
    }
  };

  return (
    <div className="login-shell">
      <div className="login-box">
        <div className="login-title">Ground Work · Admin</div>
        <p className="login-sub">
          Sign in with your admin email and password.
        </p>

        <input
          className="login-input"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          disabled={status === 'loading'}
          autoFocus
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          disabled={status === 'loading'}
        />
        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Signing in...' : 'Sign In'}
        </button>
        {status === 'error' && <div className="login-err">{errorMsg}</div>}
      </div>
    </div>
  );
}
