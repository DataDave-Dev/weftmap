"use client";

import { useMemo, useState } from "react";
import {
  filterSortTestimonials,
  type SortKey,
  type TestimonialItem,
} from "@/lib/testimonials-filter";
import Stars from "@/components/ui/Stars";
import TestimonialForm from "./TestimonialForm";

const PAGE = 6;
const RATING_FILTERS = [0, 5, 4, 3];

export type BoardLabels = {
  search: string;
  sort: string;
  sortNewest: string;
  sortOldest: string;
  sortTop: string;
  filterRating: string;
  allRatings: string;
  loadMore: string;
  noResults: string;
  signIn: string;
  empty: string;
  placeholder: string;
  submit: string;
  thanks: string;
  ratingLabel: string;
};

type Props = {
  items: TestimonialItem[];
  isAuthed: boolean;
  lang: string;
  labels: BoardLabels;
};

function Avatar({ item }: { item: TestimonialItem }) {
  if (item.userImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.userImage}
        alt=""
        width={40}
        height={40}
        className="rounded-full"
      />
    );
  }
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#4f46e5] text-sm font-semibold text-white">
      {(item.userName ?? item.userUsername ?? "?").charAt(0).toUpperCase()}
    </span>
  );
}

export default function TestimonialsBoard({
  items,
  isAuthed,
  lang,
  labels,
}: Props) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [minRating, setMinRating] = useState(0);
  const [visible, setVisible] = useState(PAGE);

  // Any filter change resets pagination back to the first page.
  const onSearch = (value: string) => {
    setQ(value);
    setVisible(PAGE);
  };
  const onSort = (value: SortKey) => {
    setSort(value);
    setVisible(PAGE);
  };
  const onRating = (value: number) => {
    setMinRating(value);
    setVisible(PAGE);
  };

  const results = useMemo(
    () => filterSortTestimonials(items, { q, sort, minRating }),
    [items, q, sort, minRating],
  );
  const shown = results.slice(0, visible);

  const card = (item: TestimonialItem, featured: boolean) => (
    <li
      key={item.id}
      className={`flex flex-col gap-4 rounded-2xl border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] p-6 ${
        featured ? "lg:col-span-2" : ""
      }`}
    >
      {item.rating ? <Stars value={item.rating} size={featured ? 18 : 15} /> : null}
      <p
        className={`leading-[1.65] text-[#0f172a] dark:text-[#e6e9ef] ${
          featured ? "text-lg" : "text-[15px]"
        }`}
      >
        {item.body}
      </p>
      <div className="mt-auto flex items-center gap-3">
        <Avatar item={item} />
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-[#0f172a] dark:text-[#e6e9ef]">
            {item.userName ?? item.userUsername ?? "—"}
          </div>
          <div className="truncate text-[12px] text-[#64748b] dark:text-[#7c8696]">
            {item.userUsername ? `@${item.userUsername} · ` : ""}
            {new Date(item.createdAt).toLocaleDateString(lang)}
          </div>
        </div>
      </div>
    </li>
  );

  const chipClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
      active
        ? "bg-brand text-white dark:bg-brand-dark"
        : "border border-line text-ink-soft hover:border-brand hover:text-ink hover:bg-slate-50 dark:border-border-dark dark:text-muted dark:hover:border-brand-dark dark:hover:text-fg dark:hover:bg-surface-hover"
    }`;

  return (
    <div>
      <div className="mt-10 max-w-2xl">
        {isAuthed ? (
          <TestimonialForm
            placeholder={labels.placeholder}
            submit={labels.submit}
            thanks={labels.thanks}
            ratingLabel={labels.ratingLabel}
          />
        ) : (
          <p className="text-[15px] text-[#475569] dark:text-[#9aa6b8]">
            {labels.signIn}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-[15px] text-[#94a3b8]">{labels.empty}</p>
      ) : (
        <>
          {/* Controls */}
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={labels.search}
              className="min-w-[200px] flex-1 rounded-full border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] px-4 py-2 text-[14px] text-[#0f172a] dark:text-[#e6e9ef] outline-none focus-visible:border-[#4f46e5]"
            />

            <label className="flex items-center gap-2 text-[13px] text-[#475569] dark:text-[#9aa6b8]">
              {labels.sort}
              <select
                value={sort}
                onChange={(e) => onSort(e.target.value as SortKey)}
                className="rounded-full border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] px-3 py-2 text-[14px] text-[#0f172a] dark:text-[#e6e9ef] outline-none focus-visible:border-[#4f46e5]"
              >
                <option value="newest">{labels.sortNewest}</option>
                <option value="oldest">{labels.sortOldest}</option>
                <option value="top">{labels.sortTop}</option>
              </select>
            </label>

            <div
              className="flex items-center gap-1.5"
              role="group"
              aria-label={labels.filterRating}
            >
              {RATING_FILTERS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRating(r)}
                  className={chipClass(minRating === r)}
                >
                  {r === 0 ? labels.allRatings : `${r}★${r < 5 ? "+" : ""}`}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {results.length === 0 ? (
            <p className="mt-10 text-[15px] text-[#94a3b8]">
              {labels.noResults}
            </p>
          ) : (
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((item, i) => card(item, i === 0))}
            </ul>
          )}

          {visible < results.length && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE)}
                className="rounded-full border border-line dark:border-border-dark px-6 py-2.5 text-[14px] font-medium text-ink-soft dark:text-muted transition-colors hover:border-brand hover:text-ink hover:bg-slate-50 dark:hover:border-brand-dark dark:hover:text-fg dark:hover:bg-surface-hover"
              >
                {labels.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
