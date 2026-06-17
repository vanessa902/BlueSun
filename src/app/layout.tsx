import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./okd.css";
import SmoothScroll from "@/components/SmoothScroll";
import OkdMotion from "@/components/OkdMotion";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "BlueSun — Luxury Real Estate",
  description:
    "Curated collection of the world's most extraordinary residences. Architecture, privacy and uncompromising design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <OkdMotion />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
