import SectionHeading from "./SectionHeading";

type Props = {
  title: string;
  callTitle: string;
  callDesc: string;
  schemaTitle: string;
  schemaDesc: string;
};

function CallGraphMini() {
  return (
    <svg
      viewBox="0 0 320 150"
      className="w-full h-auto"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <marker
          id="sc-arrow"
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
      <path
        className="edge-flow"
        d="M160 46 C 130 70, 95 80, 72 100"
        markerEnd="url(#sc-arrow)"
      />
      <path
        className="edge-flow"
        d="M160 46 C 190 70, 225 80, 248 100"
        markerEnd="url(#sc-arrow)"
      />
      <g>
        <rect
          className="fill-[#eef2ff] stroke-[#4f46e5]"
          x="110"
          y="12"
          width="100"
          height="34"
          rx="9"
        />
        <text
          className="fill-[#4f46e5] font-mono text-[13px] font-semibold"
          x="160"
          y="29"
          textAnchor="middle"
          dominantBaseline="central"
        >
          main
        </text>
      </g>
      <g>
        <rect
          className="fill-white stroke-[#cbd5e1]"
          x="20"
          y="104"
          width="100"
          height="34"
          rx="9"
        />
        <text
          className="fill-[#0f172a] font-mono text-[13px]"
          x="70"
          y="121"
          textAnchor="middle"
          dominantBaseline="central"
        >
          load
        </text>
      </g>
      <g>
        <rect
          className="fill-white stroke-[#cbd5e1]"
          x="200"
          y="104"
          width="100"
          height="34"
          rx="9"
        />
        <text
          className="fill-[#0f172a] font-mono text-[13px]"
          x="250"
          y="121"
          textAnchor="middle"
          dominantBaseline="central"
        >
          save
        </text>
      </g>
    </svg>
  );
}

function MiniTable({
  name,
  rows,
}: {
  name: string;
  rows: [string, string, string][];
}) {
  return (
    <div className="w-[150px] overflow-hidden rounded-lg border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] shadow-sm">
      <div className="border-b border-[#e2e8f0] dark:border-[#232a36] bg-[#f1f5f9] dark:bg-[#1a1f29] px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#0f172a] dark:text-[#e6e9ef]">
        {name}
      </div>
      {rows.map(([badge, col, type]) => (
        <div
          key={col}
          className="flex items-center gap-1.5 border-b border-[#eef1f5] px-2.5 py-1 text-[10px] last:border-0"
        >
          <span className="w-5 shrink-0 font-mono text-[8px] font-semibold text-orange-500">
            {badge}
          </span>
          <span className="flex-1 truncate font-mono text-[#0f172a] dark:text-[#e6e9ef]">
            {col}
          </span>
          <span className="shrink-0 font-mono text-[9px] text-[#94a3b8]">
            {type}
          </span>
        </div>
      ))}
    </div>
  );
}

function SchemaMini() {
  return (
    <div className="flex items-center justify-center gap-0 py-2">
      <MiniTable
        name="posts"
        rows={[
          ["PK", "id", "int"],
          ["FK", "author_id", "int"],
        ]}
      />
      <div className="flex flex-col items-center px-1">
        <span className="font-mono text-[9px] text-orange-500">1:N</span>
        <span className="h-px w-10 bg-orange-300" />
      </div>
      <MiniTable
        name="users"
        rows={[
          ["PK", "id", "int"],
          ["", "email", "text"],
        ]}
      />
    </div>
  );
}

export default function Showcase({
  title,
  callTitle,
  callDesc,
  schemaTitle,
  schemaDesc,
}: Props) {
  return (
    <section
      id="showcase"
      className="mx-auto w-full max-w-[1100px] px-6 py-24 max-[620px]:py-16"
    >
      <SectionHeading index="04" title={title} />

      <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line dark:border-border-dark bg-line dark:bg-border-dark shadow-[0_1px_3px_rgba(15,23,42,0.06)] max-[860px]:grid-cols-1">
        <div className="group flex flex-col bg-white dark:bg-surface p-8 transition-colors duration-300 hover:bg-slate-50 dark:hover:bg-surface-hover">
          <div className="flex flex-1 items-center justify-center py-4 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
            <CallGraphMini />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-[#0f172a] dark:text-[#e6e9ef]">
            {callTitle}
          </h3>
          <p className="mt-2 text-[15px] leading-[1.65] text-[#475569] dark:text-[#9aa6b8]">
            {callDesc}
          </p>
        </div>
        <div className="group flex flex-col bg-white dark:bg-surface p-8 transition-colors duration-300 hover:bg-slate-50 dark:hover:bg-surface-hover">
          <div className="flex flex-1 items-center justify-center py-4 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
            <SchemaMini />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-[#0f172a] dark:text-[#e6e9ef]">
            {schemaTitle}
          </h3>
          <p className="mt-2 text-[15px] leading-[1.65] text-[#475569] dark:text-[#9aa6b8]">
            {schemaDesc}
          </p>
        </div>
      </div>
    </section>
  );
}
