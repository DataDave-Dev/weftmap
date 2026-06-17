import type { ReactNode } from "react";

// Shared typography primitives for documentation pages — keeps every page
// visually consistent without pulling in a markdown/MDX toolchain.

export function H1({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-[-0.025em] text-[#0f172a] dark:text-[#e6e9ef]">
      {children}
    </h1>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-lg leading-8 text-[#475569] dark:text-[#9aa6b8]">{children}</p>;
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-14 mb-4 border-b border-[#e2e8f0] dark:border-[#232a36] pb-2 text-xl font-semibold tracking-[-0.01em] text-[#0f172a] dark:text-[#e6e9ef]">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-8 mb-2 text-[15px] font-semibold text-[#0f172a] dark:text-[#e6e9ef]">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[15px] leading-7 text-[#475569] dark:text-[#9aa6b8]">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-4 flex flex-col gap-2.5 text-[15px] leading-7 text-[#475569] dark:text-[#9aa6b8]">
      {children}
    </ul>
  );
}

export function LI({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-[#94a3b8]" />
      <span>{children}</span>
    </li>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-[#eef1f5] dark:bg-[#1a1f29] px-1.5 py-0.5 font-mono text-[0.85em] text-[#0f172a] dark:text-[#e6e9ef]">
      {children}
    </code>
  );
}

export function CodeBlock({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-[#e2e8f0] dark:border-[#232a36] bg-[#f8fafc] dark:bg-[#12151c]">
      {label && (
        <div className="border-b border-[#e2e8f0] dark:border-[#232a36] px-4 py-2 font-mono text-[11px] text-[#64748b] dark:text-[#7c8696]">
          {label}
        </div>
      )}
      <pre className="overflow-auto px-4 py-3.5 font-mono text-[13px] leading-[1.7] text-[#0f172a] dark:text-[#e6e9ef]">
        {children}
      </pre>
    </div>
  );
}

const DOT_COLORS = {
  calls: "#94a3b8",
  imports: "#0d9488",
  extends: "#7c3aed",
} as const;

export function EdgeDot({ kind }: { kind: "calls" | "imports" | "extends" }) {
  return (
    <span
      className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
      style={{ background: DOT_COLORS[kind] }}
    />
  );
}

const CALLOUT_STYLES = {
  note: "border-teal-300 bg-teal-50",
  warn: "border-amber-300 bg-amber-50",
} as const;

export function Callout({
  children,
  kind = "note",
}: {
  children: ReactNode;
  kind?: "note" | "warn";
}) {
  return (
    <div
      className={`mt-5 rounded-xl border px-4 py-3.5 text-[14px] leading-7 text-[#475569] dark:text-[#9aa6b8] ${CALLOUT_STYLES[kind]}`}
    >
      {children}
    </div>
  );
}
