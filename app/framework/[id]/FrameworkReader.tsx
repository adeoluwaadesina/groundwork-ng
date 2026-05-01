'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { EyeIcon } from '@/components/EyeIcon';
import { FrameworkMarkdown } from '@/components/FrameworkMarkdown';
import type { Framework } from '@/lib/types';

const PROGRESS_COOKIE_PREFIX = 'gw_progress_';

function getProgressCookie(id: string): number {
  if (typeof document === 'undefined') return 0;
  const match = document.cookie.match(new RegExp(`${PROGRESS_COOKIE_PREFIX}${id}=(\\d+)`));
  return match ? parseInt(match[1], 10) : 0;
}

function setProgressCookie(id: string, pct: number) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 90; // 90 days
  document.cookie = `${PROGRESS_COOKIE_PREFIX}${id}=${pct}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function FrameworkReader({ framework }: { framework: Framework }) {
  const [mode, setMode] = useState<'lite' | 'full'>('lite');
  const [progress, setProgress] = useState(0);
  const [viewCount, setViewCount] = useState(framework.views || 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewTrackedRef = useRef(false);

  // Track view (one per session)
  useEffect(() => {
    if (viewTrackedRef.current) return;
    const sessionKey = `gw_viewed_${framework.id}`;
    if (sessionStorage.getItem(sessionKey)) return;

    viewTrackedRef.current = true;
    sessionStorage.setItem(sessionKey, '1');

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: framework.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.views) setViewCount(data.views);
      })
      .catch(() => {});
  }, [framework.id]);

  // Restore scroll on mount
  useEffect(() => {
    const saved = getProgressCookie(framework.id);
    if (saved > 5 && containerRef.current) {
      const el = containerRef.current;
      // Wait a tick so layout settles
      setTimeout(() => {
        el.scrollTop = ((el.scrollHeight - el.clientHeight) * saved) / 100;
        setProgress(saved);
      }, 100);
    }
  }, [framework.id]);

  // Track scroll progress
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) return;
    const pct = Math.min(100, Math.max(0, Math.round((el.scrollTop / max) * 100)));
    setProgress(pct);
    setProgressCookie(framework.id, pct);
  }, [framework.id]);

  const content = mode === 'lite' ? framework.lite_content : framework.full_content;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="reader-root"
      style={{ height: '100vh', overflowY: 'auto', background: 'var(--white)' }}
    >
      <div className="reader-topbar">
        <Link href="/" className="reader-back">← Back</Link>
        <div className="toggle-container">
          <button
            className={`toggle-btn ${mode === 'lite' ? 'active' : ''}`}
            onClick={() => setMode('lite')}
          >
            Overview
          </button>
          <button
            className={`toggle-btn ${mode === 'full' ? 'active' : ''}`}
            onClick={() => setMode('full')}
          >
            Full Framework
          </button>
        </div>
        <div className="reader-views">
          <EyeIcon /> {viewCount.toLocaleString()}
        </div>
        <div className="reader-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="reader-body">
        <div className="reader-eyebrow">{framework.id} · {framework.sector}</div>
        <h1 className="reader-title">{framework.title}</h1>
        <p className="reader-subtitle">{framework.subtitle}</p>

        <div className="reader-byline-block">
          <div className="byline-accent" />
          <div className="byline-text">
            <div className="byline-name">Adeoluwa Adesina</div>
            <div className="byline-meta">{framework.date} · {framework.sector}</div>
          </div>
        </div>

        {mode === 'lite' ? (
          <>
            <div className="lite-badge">Overview · Lite Version</div>
            <div className="reader-content">
              <FrameworkMarkdown content={content || ''} />
            </div>
            {framework.full_content && (
              <div className="full-cta">
                <p>This is the overview. The full framework includes data, international precedents, structural analysis, and a deployment roadmap.</p>
                <button className="btn-full" onClick={() => setMode('full')}>
                  Read Full Framework →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="reader-content">
            <FrameworkMarkdown content={content || ''} />
          </div>
        )}
      </div>
    </div>
  );
}
