import SectionHeading from "./SectionHeading";

type UseCase = { title: string; desc: string };

type Props = {
  title: string;
  items: UseCase[];
};

export default function UseCases({ title, items }: Props) {
  return (
    <section id="use-cases" className="bg-[#eef1f6] dark:bg-[#10141c]">
      <div className="mx-auto w-full max-w-[1100px] px-6 py-24 max-[620px]:py-16">
        <SectionHeading index="06" title={title} />

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line dark:border-border-dark bg-line dark:bg-border-dark shadow-[0_1px_3px_rgba(15,23,42,0.06)] max-[620px]:grid-cols-1">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="group flex flex-col bg-white dark:bg-surface p-8 transition-colors duration-300 hover:bg-slate-50 dark:hover:bg-surface-hover"
            >
              <span className="font-mono text-2xl tracking-tight text-slate-300 transition-colors group-hover:text-brand dark:group-hover:text-brand-dark">
                {`0${i + 1}`}
              </span>
              <h3 className="mt-6 text-lg font-semibold text-[#0f172a] dark:text-[#e6e9ef]">
                {item.title}
              </h3>
              <p className="mt-2 max-w-[40ch] text-[15px] leading-[1.65] text-[#475569] dark:text-[#9aa6b8]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
