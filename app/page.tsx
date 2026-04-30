import { createClient } from '@/lib/supabase-server';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubscribeForm } from '@/components/SubscribeForm';
import { FrameworkList } from '@/components/FrameworkList';
import type { Framework } from '@/lib/types';

export const revalidate = 60; // Re-fetch every 60 seconds

async function getData() {
  const supabase = createClient();

  const { data: frameworks, error } = await supabase
    .from('frameworks')
    .select('*')
    .order('published_at', { ascending: false });

  const { count: subscriberCount } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true });

  if (error) console.error('Error loading frameworks:', error);

  return {
    frameworks: (frameworks || []) as Framework[],
    subscriberCount: subscriberCount || 0,
  };
}

export default async function HomePage() {
  const { frameworks, subscriberCount } = await getData();
  const totalViews = frameworks.reduce((sum, f) => sum + (f.views || 0), 0);

  return (
    <>
      <SiteHeader />

      <section className="hero">
        <div className="hero-eyebrow">Nigeria Reality-Checked · Policy and Infrastructure</div>
        <h1 className="hero-title">
          Frameworks for<br />
          <em>what Nigeria</em>
          <br />
          actually needs.
        </h1>
        <p className="hero-desc">
          Policy and infrastructure frameworks for Nigeria's future. Each framework is a structured, research-backed analysis of a sector, system, or structural challenge. Honest about what is broken, specific about what could work.
        </p>
        <div className="hero-byline">
          <div className="hero-byline-line" />
          <div className="hero-byline-name">By Adeoluwa Adesina</div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-val"><span>{frameworks.length}</span></div>
          <div className="stat-lbl">Frameworks published</div>
        </div>
        <div className="stat-item">
          <div className="stat-val"><span>{totalViews.toLocaleString()}</span></div>
          <div className="stat-lbl">Total reads</div>
        </div>
        <div className="stat-item">
          <div className="stat-val"><span>{subscriberCount.toLocaleString()}</span></div>
          <div className="stat-lbl">Subscribers</div>
        </div>
      </div>

      <section className="frameworks-section">
        <div className="section-label">All Frameworks</div>
        {frameworks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--ink-soft)', fontFamily: 'var(--mono)', fontSize: 13 }}>
            No frameworks published yet. Check back soon.
          </div>
        ) : (
          <FrameworkList frameworks={frameworks} />
        )}
      </section>

      <SubscribeForm />
      <SiteFooter />
    </>
  );
}
