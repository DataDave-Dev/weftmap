// Editorial section header: numbered eyebrow over a hairline, left-aligned title.
export default function SectionHeading({
  index,
  title,
  tone = "light",
}: {
  index: string;
  title: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className={`border-t pt-6 ${dark ? "border-white/10" : "border-[#e2e8f0] dark:border-[#232a36]"}`}>
      <span
        className={`block font-mono text-[12px] tracking-[0.28em] ${
          dark ? "text-white/50" : "text-[#94a3b8]"
        }`}
      >
        {index}
      </span>
      <h2
        className={`mt-4 max-w-[22ch] text-[clamp(2rem,3.6vw,3.1rem)] font-semibold leading-[1.05] tracking-[-0.02em] ${
          dark ? "text-white" : "text-[#0f172a] dark:text-[#e6e9ef]"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
