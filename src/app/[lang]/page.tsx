import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/Features";
import Showcase from "@/components/sections/Showcase";
import SupportedLanguages from "@/components/sections/SupportedLanguages";
import UseCases from "@/components/sections/UseCases";
import Faq from "@/components/sections/Faq";
import Testimonials from "@/components/sections/Testimonials";
import CallToAction from "@/components/sections/CallToAction";
import ScrollReveal from "@/components/ui/ScrollReveal";
import JsonLd from "@/components/seo/JsonLd";
import {
  buildFaqSchema,
  buildOrganization,
  buildSoftwareApplication,
} from "@/lib/structured-data";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <JsonLd
        data={[
          buildSoftwareApplication(lang),
          buildOrganization(),
          // Generated from the same t.faqs array the <Faq /> section below
          // renders, so the markup can never describe absent content.
          buildFaqSchema(lang),
        ]}
      />
      <ScrollReveal />
      <Hero
        badge={t.badge}
        phrase={t.hero}
        sub={t.tagline}
        getStarted={t.getStarted}
        learnMore={t.learnMore}
        supports={t.supports}
        appHref={`/${lang}/app`}
      />
      <HowItWorks heading={t.howTitle} steps={t.steps} />
      <Features
        heading={t.featuresTitle}
        features={t.features}
        moreLanguagesSoon={t.moreLanguagesSoon}
      />
      <Showcase
        title={t.showcaseTitle}
        callTitle={t.showcaseCallTitle}
        callDesc={t.showcaseCallDesc}
        schemaTitle={t.showcaseSchemaTitle}
        schemaDesc={t.showcaseSchemaDesc}
      />
      <SupportedLanguages
        title={t.languagesTitle}
        subtitle={t.languagesSubtitle}
        rows={t.languageRows}
        lang={lang}
      />
      <UseCases title={t.useCasesTitle} items={t.useCases} />
      <Faq title={t.faqTitle} items={t.faqs} />
      <Testimonials lang={lang} />
      <CallToAction
        title={t.ctaTitle}
        desc={t.ctaDesc}
        getStarted={t.getStarted}
        appHref={`/${lang}/app`}
        ossTitle={t.ctaOssTitle}
        ossDesc={t.ctaOssDesc}
        star={t.ctaStar}
        contribute={t.ctaContribute}
      />
    </>
  );
}
