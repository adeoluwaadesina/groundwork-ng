'use client';

import { useState } from 'react';

export function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('success');
      setMessage("You're in. You'll hear from me when the next framework drops.");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <section className="newsletter-section" id="subscribe">
      <div className="newsletter-block">
        <div className="newsletter-left">
          <div className="newsletter-label">Stay Informed</div>
          <h2 className="newsletter-title">New frameworks, straight to your inbox.</h2>
          <p className="newsletter-desc">
            When a new framework is published, you'll get a brief. The topic, the reality check, and a preview of the argument. No noise. Just the work.
          </p>
        </div>
        <div className="newsletter-right">
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.86)', lineHeight: 1.6 }}>
            For people who are actually invested in what's happening in Nigeria, and what could change.
          </p>
          {status !== 'success' ? (
            <>
              <div className="sub-form">
                <input
                  className="sub-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  disabled={status === 'loading'}
                />
                <button
                  className="sub-btn"
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {status === 'error' && <div className="sub-error">{message}</div>}
              <p className="sub-note">No spam. Unsubscribe anytime. Only real updates.</p>
            </>
          ) : (
            <div className="sub-success">✓ {message}</div>
          )}
        </div>
      </div>
    </section>
  );
}
