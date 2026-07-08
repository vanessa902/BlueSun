import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const haffer = localFont({
  src: [
    { path: "../fonts/HafferXH-TRIAL-Thin.otf", weight: "100", style: "normal" },
    { path: "../fonts/HafferXH-TRIAL-ThinItalic.otf", weight: "100", style: "italic" },
    { path: "../fonts/HafferXH-TRIAL-Light.otf", weight: "300", style: "normal" },
    { path: "../fonts/HafferXH-TRIAL-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../fonts/HafferXH-TRIAL-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/HafferXH-TRIAL-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/HafferXH-TRIAL-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../fonts/HafferXH-TRIAL-SemiBoldItalic.otf", weight: "600", style: "italic" },
    { path: "../fonts/HafferXH-TRIAL-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-haffer",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veldara",
  description: "Instantly craft immersive 3D worlds on the web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={haffer.variable}>
      <body>{children}</body>
    </html>
  );
}
