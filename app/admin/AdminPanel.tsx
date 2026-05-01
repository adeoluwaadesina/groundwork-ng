'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import type { Framework } from '@/lib/types';

interface Props {
  frameworks: Framework[];
  /** All rows in `subscribers` (including opted out of email). */
  subscriberCount: number;
  /** Subscribers who receive admin broadcast / announcement emails. */
  subscriberMailCount: number;
  totalViews: number;
  userEmail: string;
}

const EMPTY_FORM = {
  id: '',
  title: '',
  subtitle: '',
  sector: '',
  date: '',
  tags: '',
  lite_content: '',
  full_content: '',
};

export function AdminPanel({
  frameworks,
  subscriberCount,
  subscriberMailCount,
  totalViews,
  userEmail,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
  const [broadcastNotice, setBroadcastNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const handleSave = async () => {
    if (!form.id || !form.title) {
      setStatus('error');
      setErrorMsg('Framework ID and title are required.');
      return;
    }

    setStatus('saving');
    setErrorMsg('');

    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const supabase = createClient();

    const payload = {
      id: form.id.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      sector: form.sector.trim(),
      date: form.date.trim(),
      tags,
      lite_content: form.lite_content,
      full_content: form.full_content,
    };

    const { error } = editingId
      ? await supabase.from('frameworks').update(payload).eq('id', editingId)
      : await supabase.from('frameworks').insert(payload);

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }

    setStatus('success');
    setForm(EMPTY_FORM);
    setEditingId(null);
    router.refresh();
    setTimeout(() => setStatus('idle'), 2500);
  };

  const handleEdit = (fw: Framework) => {
    setEditingId(fw.id);
    setForm({
      id: fw.id,
      title: fw.title,
      subtitle: fw.subtitle || '',
      sector: fw.sector || '',
      date: fw.date || '',
      tags: (fw.tags || []).join(', '),
      lite_content: fw.lite_content || '',
      full_content: fw.full_content || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete framework ${id}? This cannot be undone.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from('frameworks').delete().eq('id', id);
    if (error) {
      alert('Delete failed: ' + error.message);
      return;
    }
    router.refresh();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin');
    router.refresh();
  };

  const handleBroadcast = async (frameworkId: string) => {
    setBroadcastNotice(null);
    setBroadcastingId(frameworkId);
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameworkId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBroadcastNotice({ type: 'err', text: data.error || 'Broadcast failed.' });
        return;
      }
      const sent = typeof data.sent === 'number' ? data.sent : 0;
      const extra =
        data.errors && Array.isArray(data.errors) && data.errors.length
          ? ` Some batches reported errors: ${data.errors.join(' ')}`
          : '';
      setBroadcastNotice({
        type: data.success === false ? 'err' : 'ok',
        text:
          sent === 0 && data.message
            ? data.message
            : `Queued ${sent} email(s) to subscribers.${extra}`,
      });
    } catch {
      setBroadcastNotice({ type: 'err', text: 'Network error. Try again.' });
    } finally {
      setBroadcastingId(null);
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <div className="admin-title">Ground Work · Admin Portal</div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginRight: '0.75rem' }}>
            {userEmail}
          </span>
          <button onClick={handleSignOut} className="admin-close">Sign Out</button>
          <a href="/" className="admin-close">View Site</a>
        </div>
      </div>

      <div className="admin-body">
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <div className="admin-stat">
            <div className="admin-stat-count">{subscriberCount}</div>
            <div className="admin-stat-label">Newsletter Subscribers</div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                color: 'rgba(255,255,255,0.35)',
                marginTop: '0.35rem',
                letterSpacing: '0.04em',
              }}
            >
              {subscriberMailCount} receiving email
            </div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-count">{totalViews.toLocaleString()}</div>
            <div className="admin-stat-label">Total Framework Views</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-count">{frameworks.length}</div>
            <div className="admin-stat-label">Published Frameworks</div>
          </div>
        </div>

        <div className="admin-section-title">
          {editingId ? `Editing: ${editingId}` : 'Add New Framework'}
        </div>

        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">Framework ID (e.g. NR-PWR-002)</label>
            <input
              className="admin-input"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              disabled={!!editingId}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Sector</label>
            <input
              className="admin-input"
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
            />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Title</label>
          <input
            className="admin-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Subtitle</label>
          <input
            className="admin-input"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
        </div>

        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">Date (e.g. May 2026)</label>
            <input
              className="admin-input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Tags (comma-separated)</label>
            <input
              className="admin-input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Energy, Infrastructure, Solar"
            />
          </div>
        </div>

        <div className="admin-subhead">
          <span className="admin-subhead-num">01</span>
          <span className="admin-subhead-text">Overview (Lite Version)</span>
          <span className="admin-subhead-hint">Shown first to all readers</span>
        </div>
        <div className="admin-field">
          <label className="admin-label">Overview content (2 to 4 paragraphs)</label>
          <textarea
            className="admin-textarea"
            style={{ minHeight: 180 }}
            value={form.lite_content}
            onChange={(e) => setForm({ ...form, lite_content: e.target.value })}
            placeholder="This is the short preview readers see first. Keep it tight and punchy. The strongest reality-check upfront."
          />
        </div>

        <div className="admin-subhead">
          <span className="admin-subhead-num">02</span>
          <span className="admin-subhead-text">Full Framework</span>
          <span className="admin-subhead-hint">Unlocked when reader taps Read Full Framework</span>
        </div>
        <div className="admin-field">
          <label className="admin-label">Full framework content</label>
          <textarea
            className="admin-textarea"
            style={{ minHeight: 320 }}
            value={form.full_content}
            onChange={(e) => setForm({ ...form, full_content: e.target.value })}
            placeholder="Paste the full framework text here. Sections, data, precedents, roadmap. The complete piece."
          />
        </div>

        <button
          className="admin-save"
          onClick={handleSave}
          disabled={status === 'saving'}
        >
          {status === 'saving' ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Framework'}
        </button>

        {editingId && (
          <button
            className="admin-btn-sm"
            style={{ marginLeft: '1rem', padding: '8px 16px' }}
            onClick={handleCancelEdit}
          >
            Cancel Edit
          </button>
        )}

        {status === 'success' && <div className="admin-success">✓ Saved successfully.</div>}
        {status === 'error' && <div className="admin-error">{errorMsg}</div>}
        {broadcastNotice && (
          <div
            className={broadcastNotice.type === 'ok' ? 'admin-success' : 'admin-error'}
            style={{ marginTop: '0.75rem' }}
          >
            {broadcastNotice.type === 'ok' ? '✓ ' : ''}
            {broadcastNotice.text}
          </div>
        )}

        <div className="admin-framework-list">
          <div className="admin-section-title" style={{ marginTop: '2rem' }}>
            Published Frameworks
          </div>
          {frameworks.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--mono)', fontSize: 12, padding: '1rem 0' }}>
              No frameworks yet. Add your first one above.
            </div>
          ) : (
            frameworks.map((fw) => (
              <div key={fw.id} className="admin-fw-item">
                <div>
                  <div className="admin-fw-id">{fw.id}</div>
                  <div className="admin-fw-title">{fw.title}</div>
                  <div className="admin-fw-meta">
                    {fw.views || 0} views · {fw.date}
                  </div>
                </div>
                <div className="admin-fw-actions">
                  <button
                    className="admin-btn-sm"
                    onClick={() => handleBroadcast(fw.id)}
                    disabled={broadcastingId !== null || subscriberMailCount === 0}
                    title={
                      subscriberMailCount === 0
                        ? 'No subscribers opted in to emails (or add subscribers first)'
                        : undefined
                    }
                  >
                    {broadcastingId === fw.id ? 'Sending…' : 'Send to subscribers'}
                  </button>
                  <button className="admin-btn-sm" onClick={() => handleEdit(fw)}>
                    Edit
                  </button>
                  <button
                    className="admin-btn-sm admin-btn-del"
                    onClick={() => handleDelete(fw.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
