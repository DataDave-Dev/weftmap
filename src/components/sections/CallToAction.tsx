import Link from "next/link";
import { REPO_URL as REPO } from "@/lib/constants";

const GOOD_FIRST = `${REPO}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`;

type Props = {
  title: string;
  desc: string;
  getStarted: string;
  appHref: string;
  ossTitle: string;
  ossDesc: string;
  star: string;
  contribute: string;
};

export default function CallToAction({
  title,
  desc,
  getStarted,
  appHref,
  ossTitle,
  ossDesc,
  star,
  contribute,
}: Props) {
  return (
    <section
      id="cta"
      className="relative isolate overflow-hidden bg-[#f6f7f9] dark:bg-[#0b0d12]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[90%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(79,70,229,0.10),transparent)] blur-[120px]"
      />
      <div className="mx-auto grid max-w-[1100px] grid-cols-[1.4fr_1fr] gap-x-12 gap-y-12 px-6 py-24 max-[860px]:grid-cols-1 max-[620px]:py-20">
        <div>
          <h2 className="max-w-[16ch] text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#0f172a] dark:text-[#e6e9ef]">
            {title}
          </h2>
          <p className="mt-5 max-w-[44ch] text-[1.05rem] leading-relaxed text-[#475569] dark:text-[#9aa6b8]">
            {desc}
          </p>
          <Link
            href={appHref}
            className="mt-8 inline-block rounded-full bg-[#4f46e5] dark:bg-[#6366f1] px-8 py-3.5 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(79,70,229,0.6)] transition hover:-translate-y-px hover:bg-[#4338ca]"
          >
            {getStarted}
          </Link>
        </div>

        <div className="flex flex-col justify-center border-l border-[#e2e8f0] dark:border-[#232a36] pl-12 max-[860px]:border-l-0 max-[860px]:border-t max-[860px]:pl-0 max-[860px]:pt-10">
          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#64748b] dark:text-[#7c8696]">
            {ossTitle}
          </span>
          <p className="mt-3 max-w-[36ch] text-[15px] leading-[1.6] text-[#475569] dark:text-[#9aa6b8]">
            {ossDesc}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex w-fit items-center gap-2 text-sm text-[#0f172a] dark:text-[#e6e9ef] transition-colors hover:text-[#4f46e5]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.57 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.71.08-.71 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.65 1.66.24 2.88.12 3.18.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.69.83.57A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
              </svg>
              {star}
            </a>
            <a
              href={GOOD_FIRST}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 text-sm text-[#475569] dark:text-[#9aa6b8] transition-colors hover:text-[#4f46e5]"
            >
              <span className="font-mono text-base leading-none">+</span>
              {contribute}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
