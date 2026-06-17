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
      className="mx-auto flex min-h-screen w-full max-w-[820px] flex-col justify-center px-6 py-28 max-[620px]:py-16"
    >
      <SectionHeading index="07" title={title} />

      <div className="mt-12 border-t border-white/10">
        {items.map((item) => (
          <details key={item.q} className="group border-b border-white/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[16px] font-medium text-fg transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden="true"
                className="font-mono text-lg text-muted/60 transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="max-w-[64ch] pb-5 text-[15px] leading-[1.7] text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
