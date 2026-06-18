"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  postTestimonial,
  type TestimonialFormState,
} from "@/lib/testimonials";

const INITIAL: TestimonialFormState = { ok: false };

type Props = {
  placeholder: string;
  submit: string;
  thanks: string;
  ratingLabel: string;
};

export default function TestimonialForm({
  placeholder,
  submit,
  thanks,
  ratingLabel,
}: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(postTestimonial, INITIAL);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.ok) return;
    formRef.current?.reset();
    router.refresh();
    // Reset the controlled star selector after a successful async submission.
    /* eslint-disable react-hooks/set-state-in-effect */
    setRating(0);
    setHover(0);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [state, router]);

  const shown = hover || rating;

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-3">
        <span className="text-[13px] text-[#475569] dark:text-[#9aa6b8]">
          {ratingLabel}
        </span>
        <div
          className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400"
          onMouseLeave={() => setHover(0)}
        >
          {Array.from({ length: 5 }, (_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                aria-label={`${value} / 5`}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHover(value)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill={value <= shown ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9 6.2 20.9l1.1-6.47-4.7-4.58 6.5-.95z" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      <textarea
        name="body"
        required
        minLength={3}
        maxLength={1000}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] px-4 py-3 text-[15px] text-[#0f172a] dark:text-[#e6e9ef] outline-none focus-visible:border-[#4f46e5]"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || rating === 0}
          className="rounded-full bg-[#4f46e5] dark:bg-[#6366f1] px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-px disabled:opacity-50 disabled:translate-y-0"
        >
          {submit}
        </button>
        {state.ok && (
          <span className="text-[13px] text-emerald-600 dark:text-emerald-400">
            {thanks}
          </span>
        )}
      </div>
    </form>
  );
}
