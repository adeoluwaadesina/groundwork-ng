'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

const FLASH_KEY = 'gw_auth_flash';

function setFlash(message: string) {
  try {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message }));
  } catch {
    /* ignore */
  }
}

/**
 * Supabase puts magic-link results in the URL hash (#access_token or #error).
 * The server never receives the hash, so we finish auth in the browser.
 * Skips /auth/callback so that page can handle ?code= and ?next= together.
 */
export function AuthHashFragmentHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash?.replace(/^#/, '');
    if (!hash) return;

    if (pathname?.startsWith('/auth/callback')) {
      return;
    }

    const params = new URLSearchParams(hash);
    const err = params.get('error');

    if (err) {
      const desc = params.get('error_description');
      const code = params.get('error_code');
      let message = 'Sign-in link could not be used.';
      if (desc) {
        message = decodeURIComponent(desc.replace(/\+/g, ' '));
      } else if (code === 'otp_expired') {
        message =
          'That sign-in link has expired or was already used. Request a new link below.';
      }
      setFlash(message);
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`
      );
      router.replace('/admin');
      return;
    }

    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (!access_token || !refresh_token) return;

    const supabase = createClient();
    void supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`
      );
      if (error) {
        setFlash(error.message || 'Sign-in failed.');
        router.replace('/admin');
        return;
      }
      if (pathname === '/admin' || pathname?.startsWith('/admin/')) {
        router.refresh();
      } else {
        router.replace('/admin');
      }
    });
  }, [pathname, router]);

  return null;
}
