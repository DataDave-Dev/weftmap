"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Diagram from "./Diagram";
import type { Graph } from "@/lib/analysis/types";

const LANGUAGES = ["python", "javascript", "typescript", "go", "rust", "sql"];

const EXT: Record<string, string> = {
  python: "py",
  javascript: "js",
  typescript: "ts",
  go: "go",
  rust: "rs",
  sql: "sql",
};

const PROJECT_EXTS: Record<string, string[]> = {
  python: [".py"],
  javascript: [".js", ".jsx", ".mjs", ".cjs"],
  typescript: [".ts", ".tsx"],
  go: [".go"],
  rust: [".rs"],
  sql: [".sql"],
};

const IGNORE_DIR =
  /(^|\/)(node_modules|\.git|\.next|dist|build|out|\.venv|venv|__pycache__)(\/|$)/;
const MAX_FILES = 400;
const MAX_TOTAL_BYTES = 2_000_000;

const SAMPLES: Record<string, string> = {
  python: `def main():
    data = load()
    save(transform(data))

def load():
    return read()

def transform(data):
    return clean(data)

def clean(data):
    return data

def save(x):
    write(x)

main()
`,
  javascript: `function main() {
  const data = load();
  save(transform(data));
}

function load() {
  return read();
}

function transform(data) {
  return clean(data);
}

function clean(data) {
  return data;
}

function save(x) {
  write(x);
}

main();
`,
  typescript: `function main(): void {
  const data = load();
  save(transform(data));
}

function load(): number[] {
  return read();
}

function transform(data: number[]): number[] {
  return clean(data);
}

function clean(data: number[]): number[] {
  return data;
}

function save(x: number[]): void {
  write(x);
}

main();
`,
  go: `package main

func main() {
	data := load()
	save(transform(data))
}

func load() []int {
	return read()
}

func transform(data []int) []int {
	return clean(data)
}

func clean(data []int) []int {
	return data
}

func save(x []int) {
	write(x)
}
`,
  rust: `fn main() {
    let data = load();
    save(transform(data));
}

fn load() -> Vec<i32> {
    read()
}

fn transform(data: Vec<i32>) -> Vec<i32> {
    clean(data)
}

fn clean(data: Vec<i32>) -> Vec<i32> {
    data
}

fn save(x: Vec<i32>) {
    write(x);
}
`,
  sql: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users (id),
  title TEXT NOT NULL
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts (id),
  FOREIGN KEY (tag_id) REFERENCES tags (id)
);
`,
};

const SAMPLE_VALUES = Object.values(SAMPLES);

type LoadedFile = { path: string; content: string };

type Props = {
  languageLabel: string;
  analyzeLabel: string;
  analyzingLabel: string;
  inputPlaceholder: string;
  diagramPlaceholder: string;
  noFunctions: string;
  noTables: string;
  snippetTab: string;
  projectTab: string;
  uploadFolder: string;
  projectHint: string;
};

export default function CodeWorkspace({
  languageLabel,
  analyzeLabel,
  analyzingLabel,
  inputPlaceholder,
  diagramPlaceholder,
  noFunctions,
  noTables,
  snippetTab,
  projectTab,
  uploadFolder,
  projectHint,
}: Props) {
  const [mode, setMode] = useState<"snippet" | "project">("snippet");
  const [code, setCode] = useState(SAMPLES.python);
  const [language, setLanguage] = useState("python");
  const [files, setFiles] = useState<LoadedFile[] | null>(null);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorWidth, setEditorWidth] = useState(44); // % of the split, lg+ only
  const gutterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const draggingRef = useRef(false);

  const lineCount = useMemo(() => code.split("\n").length, [code]);

  // `webkitdirectory` is non-standard and absent from the React input typings.
  useEffect(() => {
    folderRef.current?.setAttribute("webkitdirectory", "");
  }, []);

  function onSplitDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onSplitMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setEditorWidth(Math.min(70, Math.max(25, pct))); // clamp 25–70%
  }
  function onSplitUp(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  async function onPickFolder(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-picking the same folder
    const allowed = PROJECT_EXTS[language] ?? [];
    const picked = list
      .filter(
        (f) =>
          allowed.some((x) => f.name.endsWith(x)) &&
          !IGNORE_DIR.test(f.webkitRelativePath),
      )
      .slice(0, MAX_FILES);

    if (picked.length === 0) {
      setFiles(null);
      setError("No se encontraron archivos analizables para este lenguaje.");
      return;
    }

    const loaded = await Promise.all(
      picked.map(async (f) => ({
        path: f.webkitRelativePath,
        content: await f.text(),
      })),
    );
    let total = 0;
    const kept = loaded.filter((f) => (total += f.content.length) <= MAX_TOTAL_BYTES);

    setError(null);
    setFiles(kept);
  }

  async function analyze() {
    if (isLoading) return;
    let body: Record<string, unknown>;
    if (mode === "project") {
      if (!files || files.length === 0) return;
      body = { files, language };
    } else {
      const trimmed = code.trim();
      if (trimmed === "") return;
      body = { code: trimmed, language };
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setGraph(data as Graph);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setGraph(null);
    } finally {
      setIsLoading(false);
    }
  }

  function onLanguageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setLanguage(next);
    // Swap the demo snippet only while the editor still holds an untouched sample.
    setCode((cur) => (SAMPLE_VALUES.includes(cur) ? SAMPLES[next] ?? cur : cur));
    setFiles(null); // file extensions differ per language
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      analyze();
    }
  }

  function syncScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
  }

  const canAnalyze =
    !isLoading &&
    (mode === "snippet" ? code.trim() !== "" : (files?.length ?? 0) > 0);

  const tab = (value: "snippet" | "project", label: string) => (
    <button
      onClick={() => setMode(value)}
      className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${mode === value
          ? "bg-[#eef2ff] dark:bg-[#1b1f3a] text-[#0f172a] dark:text-[#e6e9ef]"
          : "text-[#475569] dark:text-[#9aa6b8] hover:text-[#0f172a]"
        }`}
    >
      {label}
    </button>
  );

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row h-[calc(100vh-65px)]">
      {/* hidden folder picker (webkitdirectory set via ref) */}
      <input
        ref={folderRef}
        type="file"
        multiple
        onChange={onPickFolder}
        className="hidden"
      />

      {/* ── Editor pane ── */}
      <section
        style={{ ["--editor-w" as string]: `${editorWidth}%` }}
        className="flex flex-col min-h-[46vh] lg:min-h-0 w-full lg:w-[var(--editor-w)] border-b lg:border-b-0 border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c]"
      >
        {/* Tab bar: mode toggle + context info */}
        <div className="flex items-center justify-between h-11 px-3 border-b border-[#e2e8f0] dark:border-[#232a36] bg-[#f8fafc] dark:bg-[#12151c]">
          <div className="flex items-center gap-1">
            {tab("snippet", snippetTab)}
            {tab("project", projectTab)}
          </div>
          <span className="font-mono text-[11px] text-[#64748b] dark:text-[#7c8696] pr-1">
            {mode === "snippet"
              ? `main.${EXT[language] ?? "txt"} · ${lineCount} ${lineCount === 1 ? "line" : "lines"}`
              : files
                ? `${files.length} ${files.length === 1 ? "file" : "files"}`
                : "—"}
          </span>
        </div>

        {/* Body */}
        {mode === "snippet" ? (
          <div className="relative flex flex-1 overflow-hidden font-mono text-[13px] leading-[1.7]">
            <div
              ref={gutterRef}
              aria-hidden="true"
              className="shrink-0 overflow-hidden select-none py-3.5 pl-4 pr-3 text-right text-[#cbd5e1] border-r border-[#eef1f5] bg-[#f1f5f9] dark:bg-[#1a1f29]"
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={onKeyDown}
              onScroll={syncScroll}
              spellCheck={false}
              placeholder={inputPlaceholder}
              className="flex-1 resize-none bg-transparent py-3.5 px-4 text-[#0f172a] dark:text-[#e6e9ef] outline-none"
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            {!files ? (
              <button
                onClick={() => folderRef.current?.click()}
                className="group grid place-items-center w-full h-full min-h-[260px] rounded-xl border border-dashed border-[#e2e8f0] dark:border-[#232a36] hover:border-[#4f46e5] hover:bg-[#f8fafc] transition-colors"
              >
                <div className="text-center px-6">
                  <div className="mx-auto mb-4 grid place-items-center w-12 h-12 rounded-xl border border-[#e2e8f0] dark:border-[#232a36] text-[#475569] dark:text-[#9aa6b8] group-hover:text-[#0f172a] transition-colors">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <path d="M12 11v5M9.5 13.5 12 11l2.5 2.5" />
                    </svg>
                  </div>
                  <p className="font-medium text-[#0f172a] dark:text-[#e6e9ef]">{uploadFolder}</p>
                  <p className="mt-1.5 text-[13px] text-[#475569] dark:text-[#9aa6b8] max-w-[34ch]">{projectHint}</p>
                </div>
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => folderRef.current?.click()}
                  className="self-start rounded-lg border border-[#e2e8f0] dark:border-[#232a36] px-3 py-1.5 text-[12px] text-[#475569] dark:text-[#9aa6b8] hover:text-[#0f172a] hover:border-[#4f46e5] transition-colors"
                >
                  {uploadFolder}
                </button>
                <ul className="rounded-lg border border-[#e2e8f0] dark:border-[#232a36] divide-y divide-[#eef1f5] overflow-hidden">
                  {files.map((f) => (
                    <li
                      key={f.path}
                      className="px-3 py-2 font-mono text-[12px] text-[#475569] dark:text-[#9aa6b8] truncate"
                      title={f.path}
                    >
                      {f.path}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-5 border-t border-[#e2e8f0] dark:border-[#232a36] bg-[#f8fafc] dark:bg-[#12151c]">
          <label className="flex items-center gap-2 text-sm text-[#475569] dark:text-[#9aa6b8]">
            {languageLabel}
            <select
              value={language}
              onChange={onLanguageChange}
              className="rounded-lg border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#12151c] px-2.5 py-1.5 text-sm text-[#0f172a] dark:text-[#e6e9ef] outline-none focus-visible:border-[#4f46e5]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3">
            {mode === "snippet" && (
              <kbd className="hidden sm:inline font-mono text-[11px] text-[#94a3b8]">
                ⌘/Ctrl + ↵
              </kbd>
            )}
            <button
              onClick={analyze}
              disabled={!canAnalyze}
              className="bg-[#4f46e5] dark:bg-[#6366f1] text-white rounded-full px-6 py-2 text-sm font-semibold cursor-pointer transition hover:-translate-y-px disabled:opacity-50 disabled:cursor-default disabled:translate-y-0"
            >
              {isLoading ? analyzingLabel : analyzeLabel}
            </button>
          </div>
        </div>
      </section>

      {/* ── Draggable splitter (lg+) ── */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        onPointerDown={onSplitDown}
        onPointerMove={onSplitMove}
        onPointerUp={onSplitUp}
        className="hidden lg:block shrink-0 w-1.5 cursor-col-resize touch-none bg-[#e2e8f0] hover:bg-[#cbd5e1] active:bg-[#94a3b8] transition-colors"
      />

      {/* ── Diagram pane ── */}
      <section className="relative flex flex-1 flex-col bg-[#f6f7f9] dark:bg-[#0b0d12] min-w-0">
        {/* Canvas chrome */}
        <div className="flex items-center justify-between h-11 px-4 border-b border-[#e2e8f0] dark:border-[#232a36] bg-[#f8fafc] dark:bg-[#12151c]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wide text-[#64748b] dark:text-[#7c8696]">
              {language === "sql" ? "schema diagram" : "call graph"}
            </span>
          </div>
          {graph && (
            <span className="font-mono text-[11px] text-[#64748b] dark:text-[#7c8696]">
              {graph.nodes.length} nodes · {graph.edges.length} edges
            </span>
          )}
        </div>

        {/* Canvas body */}
        <div className="relative flex-1">
          <div className="absolute inset-0">
            {isLoading ? (
              <div className="grid place-items-center h-full text-sm text-[#475569] dark:text-[#9aa6b8]">
                {analyzingLabel}
              </div>
            ) : error ? (
              <div className="grid place-items-center h-full px-6 text-center text-sm text-red-400">
                {error}
              </div>
            ) : graph ? (
              <Diagram graph={graph} emptyLabel={language === "sql" ? noTables : noFunctions} />
            ) : (
              <div className="grid place-items-center h-full px-6 text-center text-sm text-[#475569] dark:text-[#9aa6b8]">
                {diagramPlaceholder}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
