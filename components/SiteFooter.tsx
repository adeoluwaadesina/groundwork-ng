export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-left">
        © {new Date().getFullYear()} · GROUND WORK · All frameworks by Adeoluwa Adesina
      </div>
      <div className="footer-right">
        <div className="footer-dot" />
        <div className="footer-name">Adeoluwa Adesina</div>
      </div>
    </footer>
  );
}
