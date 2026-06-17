export default function HeroPreview() {
  return (
    <div
      className="js-card w-full max-w-[420px] mx-auto rounded-2xl border border-[color:var(--color-line)] bg-white dark:bg-[#12151c] p-4 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]"
      aria-hidden="true"
    >
      <div className="w-full rounded-xl border border-white/10 bg-[#13151b] overflow-hidden">
        <div className="flex gap-1.5 px-3 py-2.5 border-b border-white/[0.08]">
          <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
          <span className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
          <span className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
        </div>
        <pre className="m-0 px-[18px] py-4 font-mono text-[13.5px] leading-[1.8] text-[#cbd5e1]">
          <span className="text-[#8aa0bd]">def</span>{" "}
          <span className="text-white font-semibold">main</span>():{"\n"}
          {"    "}
          <span className="text-white font-semibold">load</span>(){"\n"}
          {"    "}
          <span className="text-white font-semibold">save</span>()
        </pre>
      </div>

      <svg
        className="js-connector my-3 mx-auto text-slate-300"
        width="24"
        height="30"
        viewBox="0 0 24 34"
        fill="none"
      >
        <path d="M12 0 V26" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M5 21 L12 30 L19 21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <svg className="w-full h-auto" viewBox="0 0 320 150" fill="none">
        <defs>
          <marker
            id="cv-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="#34d399" />
          </marker>
        </defs>

        <path className="edge-flow js-edge" d="M160 46 C 130 70, 95 80, 72 100" markerEnd="url(#cv-arrow)" />
        <path className="edge-flow js-edge" d="M160 46 C 190 70, 225 80, 248 100" markerEnd="url(#cv-arrow)" />

        <g className="js-node-main">
          <rect className="fill-[#eef2ff] stroke-[#4f46e5]" x="110" y="12" width="100" height="34" rx="9" />
          <text className="fill-[#4f46e5] font-mono text-[13px] font-semibold" x="160" y="29" textAnchor="middle" dominantBaseline="central">main</text>
        </g>
        <g className="js-node-child">
          <rect className="fill-white stroke-[#cbd5e1]" x="20" y="104" width="100" height="34" rx="9" />
          <text className="fill-[#0f172a] font-mono text-[13px]" x="70" y="121" textAnchor="middle" dominantBaseline="central">load</text>
        </g>
        <g className="js-node-child">
          <rect className="fill-white stroke-[#cbd5e1]" x="200" y="104" width="100" height="34" rx="9" />
          <text className="fill-[#0f172a] font-mono text-[13px]" x="250" y="121" textAnchor="middle" dominantBaseline="central">save</text>
        </g>
      </svg>
    </div>
  );
}
