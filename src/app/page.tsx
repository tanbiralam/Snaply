import BeforeAfter from "@/components/landing/BeforeAfter";
import CTA from "@/components/landing/CTA";
import Demo from "@/components/landing/Demo";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Nav from "@/components/landing/Nav";
import UseCases from "@/components/landing/UseCases";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <BeforeAfter />
        <Features />
        <Demo />
        <UseCases />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
