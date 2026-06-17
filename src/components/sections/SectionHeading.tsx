// Editorial section header: numbered eyebrow over a hairline, left-aligned title.
export default function SectionHeading({
  index,
  title,
}: {
  index: string;
  title: string;
}) {
  return (
    <div className="border-t border-white/10 pt-6">
      <span className="block font-mono text-[12px] tracking-[0.28em] text-muted/80">
        {index}
      </span>
      <h2 className="mt-4 max-w-[22ch] text-[clamp(2rem,3.6vw,3.1rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-fg">
        {title}
      </h2>
    </div>
  );
}
