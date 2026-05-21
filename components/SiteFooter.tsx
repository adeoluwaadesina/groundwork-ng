import { BrandLogo } from '@/components/BrandLogo';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <BrandLogo variant="footer" href="/" />
      </div>
      <div className="footer-meta">
        <div className="footer-left">
          © {new Date().getFullYear()} · All frameworks by Adeoluwa Adesina
        </div>
        <div className="footer-right">
          <div className="footer-dot" />
          <div className="footer-name">Adeoluwa Adesina</div>
        </div>
      </div>
    </footer>
  );
}
