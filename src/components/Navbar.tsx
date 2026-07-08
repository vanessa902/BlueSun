import "../app/header.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// "#hero" only resolves on the homepage itself, so route through it
// explicitly — this is what both the logo and the "Home" link use, so
// they always land on the same place regardless of which page you're on.
const HOME_HREF = `${BASE}/#hero`;

const NAV_ITEMS = [
  { label: "Home", href: HOME_HREF },
  { label: "About Us", href: `${BASE}/about` },
  { label: "Our Market", href: `${BASE}/our-markets` },
  { label: "Projects", href: `${BASE}/projects` },
  { label: "Contact us", href: `${BASE}/contact` },
];

/**
 * Fixed glass header: a rectangular bar with chamfered (cut) corners and a
 * frosted-glass backdrop. Logo on the left, nav links on the right.
 */
export default function Navbar() {
  return (
    <header className="bsnav">
      <a className="bsnav__logo" href={HOME_HREF} aria-label="Home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${BASE}/logo.webp`} alt="BlueSun" />
      </a>

      <nav className="bsnav__links" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <a key={item.label} className="bsnav__link" href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
