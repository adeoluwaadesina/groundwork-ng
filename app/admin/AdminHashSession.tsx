'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

/**
 * Magic links sometimes redirect with tokens in the URL hash (#access_token=…).
 * The server never sees hashes, so we establish the session in the browser here.
 */
export function AdminHashSession() {
  const router = useRouter();

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (!hash || hash.length < 2) return;

    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    const params = new URLSearchParams(raw);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const error = params.get('error');

    if (error) {
      window.history.replaceState(null, '', '/admin');
      return;
    }

    if (!access_token || !refresh_token) return;

    const supabase = createClient();
    void supabase.auth.setSession({ access_token, refresh_token }).then(({ error: e }) => {
      window.history.replaceState(null, '', '/admin');
      if (!e) router.refresh();
    });
  }, [router]);

  return null;
}
