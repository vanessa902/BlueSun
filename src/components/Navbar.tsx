import "../app/header.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const NAV_ITEMS = [
  { label: "Home", href: "#hero" },
  { label: "About Us", href: `${BASE}/about` },
  { label: "Our Market", href: "#work" },
  { label: "Projects", href: "#work" },
  { label: "Contact us", href: "#contact" },
];

/**
 * Fixed glass header: a rectangular bar with chamfered (cut) corners and a
 * frosted-glass backdrop. Logo on the left, nav links on the right.
 */
export default function Navbar() {
  return (
    <header className="bsnav">
      <a className="bsnav__logo" href="#hero" aria-label="Home">
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
