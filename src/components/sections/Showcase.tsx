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
    <svg viewBox="0 0 320 150" className="w-full h-auto" fill="none" aria-hidden="true">
      <defs>
        <marker id="sc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="rgba(255,255,255,0.5)" />
        </marker>
      </defs>
      <path className="edge-flow" d="M160 46 C 130 70, 95 80, 72 100" markerEnd="url(#sc-arrow)" />
      <path className="edge-flow" d="M160 46 C 190 70, 225 80, 248 100" markerEnd="url(#sc-arrow)" />
      <g>
        <rect className="fill-[#161b26] stroke-[rgba(255,255,255,0.5)]" x="110" y="12" width="100" height="34" rx="9" />
        <text className="fill-[#e6e9ef] font-mono text-[13px]" x="160" y="29" textAnchor="middle" dominantBaseline="central">main</text>
      </g>
      <g>
        <rect className="fill-[#11141c] stroke-[rgba(255,255,255,0.22)]" x="20" y="104" width="100" height="34" rx="9" />
        <text className="fill-[#e6e9ef] font-mono text-[13px]" x="70" y="121" textAnchor="middle" dominantBaseline="central">load</text>
      </g>
      <g>
        <rect className="fill-[#11141c] stroke-[rgba(255,255,255,0.22)]" x="200" y="104" width="100" height="34" rx="9" />
        <text className="fill-[#e6e9ef] font-mono text-[13px]" x="250" y="121" textAnchor="middle" dominantBaseline="central">save</text>
      </g>
    </svg>
  );
}

function MiniTable({ name, rows }: { name: string; rows: [string, string, string][] }) {
  return (
    <div className="w-[150px] overflow-hidden rounded-lg border border-white/15 bg-[#11141c]">
      <div className="border-b border-white/10 bg-white/[0.05] px-2.5 py-1.5 font-mono text-[11px] font-semibold text-fg">
        {name}
      </div>
      {rows.map(([badge, col, type]) => (
        <div key={col} className="flex items-center gap-1.5 border-b border-white/[0.05] px-2.5 py-1 text-[10px] last:border-0">
          <span className="w-5 shrink-0 font-mono text-[8px] font-semibold text-orange-300">{badge}</span>
          <span className="flex-1 truncate font-mono text-[#cbd5e1]">{col}</span>
          <span className="shrink-0 font-mono text-[9px] text-muted/60">{type}</span>
        </div>
      ))}
    </div>
  );
}

function SchemaMini() {
  return (
    <div className="flex items-center justify-center gap-0 py-2">
      <MiniTable name="posts" rows={[["PK", "id", "int"], ["FK", "author_id", "int"]]} />
      <div className="flex flex-col items-center px-1">
        <span className="font-mono text-[9px] text-orange-300/80">1:N</span>
        <span className="h-px w-10 bg-orange-300/40" />
      </div>
      <MiniTable name="users" rows={[["PK", "id", "int"], ["", "email", "text"]]} />
    </div>
  );
}

export default function Showcase({ title, callTitle, callDesc, schemaTitle, schemaDesc }: Props) {
  return (
    <section
      id="showcase"
      className="relative isolate overflow-hidden bg-[#0b0d12]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(79,70,229,0.18),transparent)] blur-[120px]"
      />
      <div className="relative mx-auto w-full max-w-[1100px] px-6 py-24 max-[620px]:py-16">
        <SectionHeading index="04" title={title} tone="dark" />

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 max-[860px]:grid-cols-1">
          <div className="group flex flex-col bg-[#0c0e14] p-8 transition-colors duration-300 hover:bg-[#101319]">
            <div className="flex flex-1 items-center justify-center py-4 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
              <CallGraphMini />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-white">{callTitle}</h3>
            <p className="mt-2 text-[15px] leading-[1.65] text-slate-400">{callDesc}</p>
          </div>
          <div className="group flex flex-col bg-[#0c0e14] p-8 transition-colors duration-300 hover:bg-[#101319]">
            <div className="flex flex-1 items-center justify-center py-4 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
              <SchemaMini />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-white">{schemaTitle}</h3>
            <p className="mt-2 text-[15px] leading-[1.65] text-slate-400">{schemaDesc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
