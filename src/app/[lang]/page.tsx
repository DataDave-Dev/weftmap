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
import CallToAction from "@/components/sections/CallToAction";
import ScrollReveal from "@/components/ui/ScrollReveal";

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
      />
      <UseCases title={t.useCasesTitle} items={t.useCases} />
      <Faq title={t.faqTitle} items={t.faqs} />
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
