'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { BRAND } from '@/components/BrandLogo';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const result = await signIn('credentials', {
        email: trimmedEmail,
        password,
        redirect: false,
      });

      if (result?.error || result?.ok === false) {
        setStatus('error');
        setErrorMsg(
          result?.error === 'CredentialsSignin'
            ? 'Invalid email or password.'
            : 'Sign-in failed. Clear site cookies for localhost, confirm NEXTAUTH_SECRET is set in .env.local, restart npm run dev, and try again.'
        );
        return;
      }

      router.refresh();
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Check your connection and try again.');
    }
  };

  return (
    <div className="login-shell">
      <div className="login-box">
        <Link href="/" className="login-home">
          Back to site
        </Link>
        <div className="login-brand">
          <Image src={BRAND.icon} alt="" width={48} height={48} className="login-brand-icon" aria-hidden />
          <Image
            src={BRAND.wordmark}
            alt="Ground Work / NR"
            width={200}
            height={48}
            className="login-brand-wordmark"
          />
        </div>
        <p className="login-sub">Admin · sign in with your email and password.</p>

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
        <div className="login-password-field">
          <input
            className="login-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            disabled={status === 'loading'}
            autoComplete="current-password"
            aria-describedby={status === 'error' && errorMsg ? 'login-error' : undefined}
          />
          <button
            type="button"
            className="login-password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            disabled={status === 'loading'}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Signing in...' : 'Sign In'}
        </button>
        {status === 'error' && (
          <div id="login-error" className="login-err" role="alert">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
