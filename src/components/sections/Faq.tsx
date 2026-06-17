import SectionHeading from "./SectionHeading";

type QA = { q: string; a: string };

type Props = {
  title: string;
  items: QA[];
};

export default function Faq({ title, items }: Props) {
  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-[820px] px-6 py-24 max-[620px]:py-16"
    >
      <SectionHeading index="07" title={title} />

      <div className="mt-10 border-t border-[#e2e8f0] dark:border-[#232a36]">
        {items.map((item) => (
          <details key={item.q} className="group border-b border-[#e2e8f0] dark:border-[#232a36]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[16px] font-medium text-[#0f172a] dark:text-[#e6e9ef] transition-colors hover:text-[#4f46e5] [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden="true"
                className="font-mono text-lg text-[#94a3b8] transition-all duration-200 group-open:rotate-45 group-open:text-[#4f46e5]"
              >
                +
              </span>
            </summary>
            <p className="max-w-[64ch] pb-5 text-[15px] leading-[1.7] text-[#475569] dark:text-[#9aa6b8]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
