import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/Features";
import Footer from "@/components/layout/Footer";
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
      <Header lang={lang} />
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
      <Footer
        lang={lang}
        tagline={t.tagline}
        license={t.license}
        contribute={t.contribute}
        product={t.footerProduct}
        resources={t.footerResources}
        footerNote={t.footerNote}
      />
    </>
  );
}
