'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { EyeIcon } from '@/components/EyeIcon';
import type { Framework } from '@/lib/types';

const STORAGE_VIEW = 'gw_framework_view_mode';

export function FrameworkList({ frameworks }: { frameworks: Framework[] }) {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('');
  const [tag, setTag] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_VIEW);
      if (v === 'grid' || v === 'list') setView(v);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VIEW, view);
    } catch {
      /* ignore */
    }
  }, [view]);

  const sectors = useMemo(() => {
    const s = new Set<string>();
    for (const f of frameworks) {
      const x = f.sector?.trim();
      if (x) s.add(x);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [frameworks]);

  const tags = useMemo(() => {
    const s = new Set<string>();
    for (const f of frameworks) {
      for (const t of f.tags || []) {
        const x = t.trim();
        if (x) s.add(x);
      }
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [frameworks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return frameworks.filter((f) => {
      if (sector && (f.sector || '').trim() !== sector) return false;
      if (tag && !(f.tags || []).some((t) => t.trim() === tag)) return false;
      if (!q) return true;
      const blob = `${f.id} ${f.title} ${f.subtitle || ''}`.toLowerCase();
      return blob.includes(q);
    });
  }, [frameworks, query, sector, tag]);

  return (
    <>
      <div className="framework-toolbar">
        <label className="fw-field">
          <span className="fw-visually-hidden">Search</span>
          <input
            type="search"
            className="fw-search"
            placeholder="Search title or ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label className="fw-field">
          <span className="fw-visually-hidden">Sector</span>
          <select className="fw-select" value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="">All sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="fw-field">
          <span className="fw-visually-hidden">Tag</span>
          <select className="fw-select" value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div className="fw-view-toggle" role="group" aria-label="Layout">
          <button
            type="button"
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            List
          </button>
          <button
            type="button"
            className={view === 'grid' ? 'active' : ''}
            onClick={() => setView('grid')}
          >
            Grid
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="fw-empty">No frameworks match your filters.</div>
      ) : (
        <div className={view === 'grid' ? 'framework-grid' : 'framework-list-wrap'}>
          {filtered.map((fw) => (
            <Link key={fw.id} href={`/framework/${fw.id}`} className="framework-card">
              <div className="card-header">
                <span className="card-id">{fw.id}</span>
                <div className="card-meta">
                  <span className="card-views">
                    <EyeIcon /> {(fw.views || 0).toLocaleString()}
                  </span>
                  <span className="card-date">{fw.date}</span>
                </div>
              </div>
              <h2 className="card-title">{fw.title}</h2>
              <p className="card-subtitle">{fw.subtitle}</p>
              <div className="card-lite">{fw.lite_content}</div>
              <div className="card-footer">
                <div className="card-tags">
                  {fw.tags?.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="read-more">Read framework →</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
