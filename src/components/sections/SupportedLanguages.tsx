import SectionHeading from "./SectionHeading";

type Row = { name: string; kind: string; detail: string };

type Props = {
  title: string;
  subtitle: string;
  rows: Row[];
};

export default function SupportedLanguages({ title, subtitle, rows }: Props) {
  return (
    <section
      id="languages"
      className="mx-auto w-full max-w-[1100px] px-6 py-24 max-[620px]:py-16"
    >
      <SectionHeading index="05" title={title} />
      <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.65] text-[#475569] dark:text-[#9aa6b8]">{subtitle}</p>

      <ul className="mt-10 border-t border-[#e2e8f0] dark:border-[#232a36]">
        {rows.map((row) => (
          <li
            key={row.name}
            className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-[#e2e8f0] dark:border-[#232a36] py-5 transition-colors hover:bg-white sm:grid-cols-[200px_140px_1fr]"
          >
            <span className="font-mono text-base text-[#0f172a] dark:text-[#e6e9ef] transition-colors group-hover:text-[#4f46e5]">{row.name}</span>
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#64748b] dark:text-[#7c8696]">
              {row.kind}
            </span>
            <span className="col-span-2 text-[14px] text-[#475569] dark:text-[#9aa6b8] sm:col-span-1">{row.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
