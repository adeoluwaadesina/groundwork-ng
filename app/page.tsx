import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SubscribeForm } from '@/components/SubscribeForm';
import { FrameworkList } from '@/components/FrameworkList';
import { countSubscribers } from '@/lib/db/subscribers';
import { listFrameworks } from '@/lib/db/frameworks';
import type { Framework } from '@/lib/types';

export const revalidate = 60;

async function getData() {
  try {
    const [frameworks, subscriberCount] = await Promise.all([
      listFrameworks(),
      countSubscribers(),
    ]);
    return {
      frameworks: frameworks as Framework[],
      subscriberCount,
    };
  } catch (error) {
    console.error('Error loading homepage data:', error);
    return { frameworks: [] as Framework[], subscriberCount: 0 };
  }
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
