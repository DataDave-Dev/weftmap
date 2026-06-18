import { auth } from "@/auth";
import { listTestimonials } from "@/lib/testimonials";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import SectionHeading from "./SectionHeading";
import TestimonialsBoard from "./TestimonialsBoard";

export default async function Testimonials({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const [session, items] = await Promise.all([auth(), listTestimonials()]);

  return (
    <section id="testimonials" className="bg-white dark:bg-[#0b0d12]">
      <div className="mx-auto w-full max-w-[1100px] px-6 py-24 max-[620px]:py-16">
        <SectionHeading index="08" title={t.auth.testimonialsTitle} />
        <p className="mt-4 max-w-[48ch] text-[15px] leading-[1.65] text-[#475569] dark:text-[#9aa6b8]">
          {t.auth.testimonialsSubtitle}
        </p>

        <TestimonialsBoard
          items={items}
          isAuthed={!!session?.user}
          lang={lang}
          labels={{
            search: t.auth.testimonialSearch,
            sort: t.auth.testimonialSort,
            sortNewest: t.auth.testimonialSortNewest,
            sortOldest: t.auth.testimonialSortOldest,
            sortTop: t.auth.testimonialSortTop,
            filterRating: t.auth.testimonialFilterRating,
            allRatings: t.auth.testimonialAllRatings,
            loadMore: t.auth.testimonialLoadMore,
            noResults: t.auth.testimonialNoResults,
            signIn: t.auth.testimonialSignIn,
            empty: t.auth.testimonialsEmpty,
            placeholder: t.auth.testimonialPlaceholder,
            submit: t.auth.testimonialSubmit,
            thanks: t.auth.testimonialThanks,
            ratingLabel: t.auth.testimonialRatingLabel,
          }}
        />
      </div>
    </section>
  );
}
