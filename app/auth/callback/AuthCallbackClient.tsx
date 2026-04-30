'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

function parseHashSession(hash: string): {
  access_token: string | null;
  refresh_token: string | null;
  error: string | null;
} {
  const q = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(q);
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    error: params.get('error'),
  };
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState('Signing you in…');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = createClient();
      const nextPath = searchParams.get('next') ?? '/admin';

      const code = searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          setMsg('Could not complete sign-in. Request a new link.');
          return;
        }
        window.history.replaceState(null, '', '/auth/callback');
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (hash) {
        const { access_token, refresh_token, error } = parseHashSession(hash);
        if (error) {
          setMsg('Sign-in link expired or invalid. Try again.');
          window.history.replaceState(null, '', '/auth/callback');
          router.replace('/admin');
          return;
        }
        if (access_token && refresh_token) {
          const { error: sessionErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (cancelled) return;
          if (sessionErr) {
            setMsg('Could not complete sign-in. Request a new link.');
            return;
          }
          window.history.replaceState(null, '', '/auth/callback');
          router.replace(nextPath);
          router.refresh();
          return;
        }
      }

      router.replace(nextPath);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="login-shell">
      <div className="login-box">
        <div className="login-title">Ground Work · Admin</div>
        <p className="login-sub">{msg}</p>
      </div>
    </div>
  );
}

export function AuthCallbackClient() {
  return (
    <Suspense
      fallback={
        <div className="login-shell">
          <div className="login-box">
            <div className="login-title">Ground Work · Admin</div>
            <p className="login-sub">Signing you in…</p>
          </div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
