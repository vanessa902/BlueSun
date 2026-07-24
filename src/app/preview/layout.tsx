import type { Metadata } from "next";

// Internal sandbox route: not linked from the header nav (see Navbar.tsx)
// and excluded from search indexing here, since it's a workspace for
// upcoming home-page changes, not a public page.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
