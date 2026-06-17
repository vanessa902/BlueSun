import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./okd.css";
import SmoothScroll from "@/components/SmoothScroll";
import OkdMotion from "@/components/OkdMotion";

const haffer = localFont({
  src: [
    { path: "../fonts/HafferXH-TRIAL-Light.otf", weight: "300", style: "normal" },
    { path: "../fonts/HafferXH-TRIAL-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/HafferXH-TRIAL-RegularItalic.otf", weight: "400", style: "italic" },
    { path: "../fonts/HafferXH-TRIAL-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/HafferXH-TRIAL-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../fonts/HafferXH-TRIAL-Bold.otf", weight: "700", style: "normal" },
    { path: "../fonts/HafferXH-TRIAL-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "../fonts/HafferXH-TRIAL-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-haffer",
  display: "swap",
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
    <html lang="en" className={`${haffer.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <OkdMotion />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
