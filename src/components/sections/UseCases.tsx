import SectionHeading from "./SectionHeading";

type UseCase = { title: string; desc: string };

type Props = {
  title: string;
  items: UseCase[];
};

export default function UseCases({ title, items }: Props) {
  return (
    <section
      id="use-cases"
      className="relative isolate flex min-h-screen items-center overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[75%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(198,206,219,0.10),transparent)] blur-[120px]"
      />
      <div className="relative mx-auto w-full max-w-[1100px] px-6 py-28 max-[620px]:py-16">
        <SectionHeading index="06" title={title} />

        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 max-[620px]:grid-cols-1">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="group flex flex-col bg-[#0c0e14] p-8 transition-colors duration-300 hover:bg-[#12151c]"
            >
              <span className="font-mono text-2xl tracking-tight text-muted/60 transition-colors group-hover:text-accent">
                {`0${i + 1}`}
              </span>
              <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 max-w-[40ch] text-[15px] leading-[1.65] text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
