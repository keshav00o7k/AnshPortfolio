import type { Metadata } from "next";
import { siteConfig } from "@/lib/data";
import { ContactPageContent } from "@/components/contact/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Let's create something worth watching. Get in touch with Ansh Vaishnav for YouTube long-form and social media video editing projects.",
  openGraph: {
    title: `Contact | ${siteConfig.name}`,
    description:
      "Let's create something worth watching. Get in touch with Ansh Vaishnav for YouTube long-form and social media video editing projects.",
  },
};

export default function ContactPage() {
  return (
    <main className="w-full min-h-[calc(100vh-160px)] flex flex-col justify-center">
      <ContactPageContent siteConfig={siteConfig} showBreadcrumb={true} />
    </main>
  );
}

