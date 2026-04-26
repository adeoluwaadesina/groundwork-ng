'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMsg('Please enter a valid email.');
      return;
    }
    setStatus('loading');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/admin')}`,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  };

  return (
    <div className="login-shell">
      <div className="login-box">
        <div className="login-title">Ground Work · Admin</div>
        <p className="login-sub">
          Enter your admin email. A one-time login link will be sent to your inbox.
        </p>

        {status === 'sent' ? (
          <div className="login-msg">
            ✓ Check your email. Click the link to sign in.
          </div>
        ) : (
          <>
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
            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending...' : 'Send Login Link'}
            </button>
            {status === 'error' && <div className="login-err">{errorMsg}</div>}
          </>
        )}
      </div>
    </div>
  );
}
