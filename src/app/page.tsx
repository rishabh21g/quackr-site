import { Hero } from "@/components/hero/hero";
import { Developers } from "@/components/sections/developers";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Pricing } from "@/components/sections/pricing";
import { ProductBento } from "@/components/sections/product-bento";
import { Problem } from "@/components/sections/problem";
import { StatsBand } from "@/components/sections/stats-band";
import { Testimonials } from "@/components/sections/testimonials";
import { WorksWith } from "@/components/sections/works-with";
import { SiteFooter } from "@/components/site/footer";
import { MobileCta } from "@/components/site/mobile-cta";
import { SiteNav } from "@/components/site/nav";

/*
  Story order: hook (hero) → proof it works with your apps → the problem → how it
  works → what you can get → proof in numbers → for builders → price → people →
  doubts answered → one last ask.
*/
export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <WorksWith />
        <Problem />
        <HowItWorks />
        <ProductBento />
        <StatsBand />
        <Developers />
        <Pricing />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <MobileCta />
    </>
  );
}
