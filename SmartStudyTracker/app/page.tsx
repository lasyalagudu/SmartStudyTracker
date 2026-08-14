import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default async function LandingPage() {
  const user = await currentUser();

  if (user) {
    redirect("/sso-callback");
  }

  return (
    <div className="min-h-screen bg-[#070B14]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}