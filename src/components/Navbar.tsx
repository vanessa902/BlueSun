const NAV_ITEMS = ["Features", "Integrations", "About", "Contact Us"];

/**
 * Lumentrack navigation: logo (left), centered glassmorphism pill with the
 * active "Home" item + links, white CTA (right), hamburger on mobile.
 * Ported to plain CSS (.lmnav*) to match the site's Tailwind-free stack.
 *
 * Drop a `/public/logo.svg` to use the real logo; falls back to a wordmark.
 */
export default function Navbar() {
  return (
    <nav className="lmnav">
      {/* Logo (left) */}
      <div className="lmnav__logo">
        <span className="lmnav__wordmark">lumentrack</span>
      </div>

      {/* Center pill (desktop) — glassmorphism */}
      <div className="lmnav__pill">
        <button className="lmnav__item is-active">Home</button>
        {NAV_ITEMS.map((item) => (
          <button key={item} className="lmnav__item">
            {item}
          </button>
        ))}
      </div>

      {/* CTA (desktop) */}
      <button className="lmnav__cta">Get Started</button>

      {/* Hamburger (mobile) */}
      <button className="lmnav__burger" aria-label="Open menu">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>
    </nav>
  );
}
