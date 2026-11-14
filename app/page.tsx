import { Hero } from "@/components/hero/Hero";
import { WorkSection } from "@/components/work/WorkSection";
import { ReelCoverflowSection } from "@/components/work/ReelCoverflowSection";
import { ChannelSection } from "@/components/channel/ChannelSection";
import { ServicesSection } from "@/components/services/ServicesSection";
import { AboutSection } from "@/components/about/AboutSection";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { FootageCtaSection } from "@/components/cta/FootageCtaSection";
import { ContactSection } from "@/components/contact/ContactSection";
import {
  getProjects,
  getChannelVideos,
  getServices,
  getProofMetrics,
  getExperiences,
  getAboutConfig,
  getTestimonials,
  siteConfig,
} from "@/lib/data";

export default async function Home() {
  const projects = await getProjects();
  const channelVideos = await getChannelVideos();
  const services = await getServices();
  const proofMetrics = await getProofMetrics();
  const experiences = await getExperiences();
  const aboutConfig = await getAboutConfig();
  const testimonials = await getTestimonials();

  return (
    <div className="w-full">
      <Hero />
      <WorkSection projects={projects} siteConfig={siteConfig} />
      <ReelCoverflowSection />
      <ChannelSection videos={channelVideos} siteConfig={siteConfig} />
      <ServicesSection services={services} />
      <AboutSection
        aboutConfig={aboutConfig}
        proofMetrics={proofMetrics}
        experiences={experiences}
      />
      <TestimonialsSection testimonials={testimonials} />
      <FootageCtaSection />
      <ContactSection siteConfig={siteConfig} />
    </div>
  );
}
