export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <a
          href="#"
          className="font-display text-xl uppercase tracking-[0.2em]"
        >
          Blue<span className="text-gold">Sun</span>
        </a>
        <ul className="flex flex-wrap gap-6 text-sm text-muted">
          {["Residences", "Collections", "About", "Journal", "Contact"].map(
            (l) => (
              <li key={l}>
                <a
                  href={`#${l.toLowerCase()}`}
                  className="transition-colors hover:text-foreground"
                >
                  {l}
                </a>
              </li>
            )
          )}
        </ul>
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} BlueSun Estates
        </p>
      </div>
    </footer>
  );
}
