import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Analytics } from "@vercel/analytics/next";
import { auth } from "@/auth";
import { getRepoStars } from "@/lib/github";
import { formatStars } from "@/lib/format";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "@fontsource-variable/lexend";
import "../globals.css";

export const metadata: Metadata = {
  title: "Weftmap",
  description: "Paste code and get an interactive call graph.",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang as Locale);
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const [session, stars] = await Promise.all([auth(), getRepoStars()]);

  return (
    <html
      lang={lang as Locale}
      dir={lang === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          type={
            typeof window === "undefined" ? "text/javascript" : "text/plain"
          }
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme:dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <div className="grid-bg" aria-hidden="true" />
        <Header
          lang={lang}
          user={session?.user ?? null}
          stars={stars !== null ? formatStars(stars) : null}
        />
        {children}
        <Footer
          lang={lang}
          tagline={t.tagline}
          license={t.license}
          contribute={t.contribute}
          product={t.footerProduct}
          resources={t.footerResources}
          footerNote={t.footerNote}
        />
        <Analytics />
      </body>
    </html>
  );
}
