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
      className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col justify-center px-6 py-28 max-[620px]:py-16"
    >
      <SectionHeading index="05" title={title} />
      <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.65] text-muted">{subtitle}</p>

      <ul className="mt-12 border-t border-white/10">
        {rows.map((row) => (
          <li
            key={row.name}
            className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-white/10 py-5 transition-colors hover:bg-white/[0.02] sm:grid-cols-[200px_140px_1fr]"
          >
            <span className="font-mono text-base text-fg">{row.name}</span>
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted/70">
              {row.kind}
            </span>
            <span className="col-span-2 text-[14px] text-muted sm:col-span-1">{row.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
