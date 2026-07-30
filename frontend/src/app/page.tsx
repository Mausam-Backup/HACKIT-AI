import FloatingNav from "@/components/ui/FloatingNav";
import Hero from "@/components/landing/Hero";
import Mission from "@/components/landing/Mission";
import CallToAction from "@/components/landing/CallToAction";
import ServiceSummary from "@/components/landing/ServiceSummary";
import Showcase from "@/components/landing/Showcase";
import Capabilities from "@/components/landing/Capabilities";
import StatsSection from "@/components/landing/StatsSection";
import VideoStories from "@/components/landing/VideoStories";
import PitchBlueprint from "@/components/landing/PitchBlueprint";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <FloatingNav />
      <main>
        <Hero />
        <Mission />
        <Showcase />
        <Capabilities />
        <ServiceSummary />
        <StatsSection />
        <PitchBlueprint />
        <VideoStories />
        {/* <Testimonials /> */}
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
