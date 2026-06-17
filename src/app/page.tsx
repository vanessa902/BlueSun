import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Properties from "@/components/Properties";
import Showcase from "@/components/Showcase";
import ZoomScroll from "@/components/ZoomScroll";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Marquee />
      <Properties />
      <Showcase />
      <ZoomScroll />
      <CTA />
      <Footer />
    </main>
  );
}
