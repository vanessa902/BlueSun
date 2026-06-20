import "../app/footer.css";

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-dots" aria-hidden="true">
        <div className="footer-dots__line" />
      </div>

      <div className="site-footer__inner">
        <div className="site-footer__top">
          <h2>Proven engineering and construction technology</h2>

          <nav className="site-footer__nav" aria-label="Footer navigation">
            <a href="#company">Company</a>
            <a href="#technology">Technology</a>
            <a href="#solutions">Solutions</a>
            <a href="#our-edge">Our Edge</a>
            <a href="#investors">Investors</a>
          </nav>

          <nav className="site-footer__nav" aria-label="Company links">
            <a href="#our-team">Our Team</a>
            <a href="#news">News</a>
            <a href="#careers">Careers</a>
            <a href="#contact">Contact Us</a>
          </nav>

          <nav className="site-footer__nav" aria-label="Social links">
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer">
              Follow Us on X
            </a>
          </nav>
        </div>

        <div className="site-footer__brand-row">
          <a className="site-footer__brand" href="#hero" aria-label="BlueSun home">
            <span className="site-footer__mark" aria-hidden="true" />
            <span className="site-footer__wordmark">BlueSun</span>
          </a>
        </div>

        <div className="site-footer__legal">
          <p>© 2026 BlueSun. All rights reserved.</p>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
}
