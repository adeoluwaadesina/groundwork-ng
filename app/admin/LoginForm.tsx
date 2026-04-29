'use client';

import { useState } from 'react';

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
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/request-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        setStatus('error');
        setErrorMsg('Something went wrong. Try again later.');
        return;
      }

      setStatus('sent');
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
          Enter your admin email. If this address is authorized, you will receive a one-time login link.
        </p>

        {status === 'sent' ? (
          <div className="login-msg">
            If this address is authorized for admin access, check your inbox for a link.
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
