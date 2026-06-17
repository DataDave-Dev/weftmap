# Weftmap

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Tree-sitter](https://img.shields.io/badge/Tree--sitter-WASM-green.svg)](https://tree-sitter.github.io/)

**🌐 Language:** **English** · [Español](README.es.md)

> Paste code, get an interactive **call graph** to understand what it does —
> across multiple languages, powered by [Tree-sitter](https://tree-sitter.github.io/).

Weftmap turns source code into a navigable diagram of which functions call
which. The differentiator is a **pluggable, multi-language architecture**: the
backend adapts the analysis per language, and adding a new one takes only a few
lines. No existing free tool does this well across several languages at once.

> **Status:** MVP. Supports **Python**, **JavaScript/TypeScript**, **Go**, **Rust** and **SQL**.
> Diagram types: call graph (functions as nodes, calls as arrows) and, for SQL,
> entity-relationship (tables as nodes, foreign keys as edges).

---

## Table of Contents

- [Features](#features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Adding a language](#adding-a-language)
- [Project structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Multi-language** — one parsing engine (Tree-sitter) for every language.
- **Pluggable** — a language is a single `LangSpec` + two Tree-sitter queries.
- **Interactive diagram** — pan, zoom and drag nodes (React Flow + dagre layout).
- **Internal call graph** — shows calls between functions defined in your code;
  calls to builtins/libraries are filtered out to keep the graph meaningful.
- **No build step for the user** — paste a snippet and hit *Analyze*.

## How it works

```
┌──────────┐   POST /api/analyze   ┌─────────────────────┐   Graph JSON   ┌─────────────┐
│  Browser │ ────────────────────▶ │  Tree-sitter (WASM) │ ─────────────▶ │  React Flow │
│ (textarea)│   { code, language }  │  per-language module │  {nodes,edges} │  (dagre)    │
└──────────┘                       └─────────────────────┘                └─────────────┘
```

1. You paste code and pick a language.
2. The backend (`src/app/api/analyze/route.ts`) validates the input, parses the
   code with the matching Tree-sitter grammar, and walks the syntax tree to build
   a normalized graph `{ nodes, edges }`.
3. The frontend lays it out with [dagre](https://github.com/dagrejs/dagre) and
   renders it interactively with [React Flow](https://reactflow.dev/).

The call graph is extracted with **declarative Tree-sitter queries** (one for
function definitions, one for calls) instead of hand-walking the AST — less code,
easier to maintain, and the same approach works for every language.

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js (App Router) | Frontend + backend in one project and one deploy |
| Language | TypeScript | Type safety across the whole stack |
| Parsing | Tree-sitter via `web-tree-sitter` (WASM) | One API for ~40 languages |
| Grammars | `tree-sitter-wasms` | Prebuilt grammar binaries |
| Diagram | React Flow + dagre | Interactive nodes, hierarchical layout |
| Tests | Vitest | Fast unit tests for the analyzers |
| Package manager | pnpm | Fast, disk-efficient installs |

## Getting started

**Requirements:** Node 20+ and [pnpm](https://pnpm.io/).

```bash
# 1. Install dependencies
pnpm install

# 2. Start the dev server
pnpm dev
# open http://localhost:3000
```

Paste a snippet, choose **python** or **javascript**, and click **Analyze**.

## Available scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start the development server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm test` | Run the analyzer tests (Vitest) |
| `pnpm typecheck` | Type-check with `tsc --noEmit` |
| `pnpm lint` | Lint with ESLint |

## Adding a language

This is the most valuable kind of contribution. The architecture is *pluggable*:
the backend adapts the analysis per language, and nothing else needs to change.

1. **Add the grammar.** Copy `tree-sitter-<lang>.wasm` into `public/wasm/`
   (available from the [`tree-sitter-wasms`](https://www.npmjs.com/package/tree-sitter-wasms)
   package).
2. **Create the analyzer.** Add `src/lib/analysis/analyzers/<lang>.ts` with a
   `LangSpec` — two Tree-sitter queries (function definitions and calls) plus the
   set of node types that count as a function scope. Use
   [`python.ts`](src/lib/analysis/analyzers/python.ts) as a template.
3. **Register it.** Add one line to
   [`src/lib/analysis/registry.ts`](src/lib/analysis/registry.ts).
4. **Add the UI option.** Add the language key to the `LANGUAGES` array in
   [`src/app/page.tsx`](src/app/page.tsx).
5. **Add a test.** Drop a snippet → expected nodes/edges check in
   `src/lib/analysis/analyzers/`.

That's it.

## Project structure

```
src/
  app/
    page.tsx                  # UI: textarea + language selector + diagram
    api/analyze/route.ts      # backend: validates input, calls the analyzer
  components/
    CodeInput.tsx             # textarea + selector + analyze button
    Diagram.tsx               # React Flow + dagre rendering
  lib/analysis/
    types.ts                  # Graph + LanguageAnalyzer contract
    registry.ts               # language registry (the only file that knows them all)
    treesitter.ts             # loads/caches the Tree-sitter runtime + grammars
    analyzers/
      shared.ts               # common call-graph extraction logic
      python.ts               # Python LangSpec
      javascript.ts           # JS/TS LangSpec
      analyzers.test.ts       # analyzer tests
public/wasm/                  # Tree-sitter runtime + grammar .wasm files
```

## Roadmap

Got an idea? [Open an issue](https://github.com/DataDave-Dev/weftmap/issues/new/choose).
Newcomer-friendly tasks are tagged [`good first issue`](https://github.com/DataDave-Dev/weftmap/issues?q=is%3Aopen+label%3A%22good+first+issue%22).

**Shipped**

- [x] Call graph for Python, JavaScript, TypeScript, Go and Rust
- [x] SQL schema diagrams (ER / UML): tables, columns, PK/FK, relationships
- [x] Pluggable per-language architecture (add a language in a few lines)
- [x] Bilingual UI (en/es) with in-app docs

**Next** — help wanted

- [ ] More languages: Ruby ([#13](https://github.com/DataDave-Dev/weftmap/issues/13)), Java ([#14](https://github.com/DataDave-Dev/weftmap/issues/14))
- [ ] Drive the Hero language chips from the registry ([#15](https://github.com/DataDave-Dev/weftmap/issues/15))
- [ ] Broaden analyzer test coverage ([#16](https://github.com/DataDave-Dev/weftmap/issues/16))
- [ ] Richer empty state when no functions are found ([#17](https://github.com/DataDave-Dev/weftmap/issues/17))

**Later**

- [ ] Project mode: analyze a whole folder as a single graph
- [ ] Node interaction: click to highlight callers/callees, function detail panel
- [ ] More diagram types: control-flow and module-dependency graphs
- [ ] Export the graph (PNG/SVG) and shareable permalinks
- [ ] More input methods: ZIP upload and GitHub repo URL
- [ ] Performance for large codebases

## Contributing

Contributions are welcome — especially new languages. Please read
[CONTRIBUTING.md](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md).

Quick rules: `main` is protected (open a PR, CI must pass, one review required),
and commits follow [Conventional Commits](https://www.conventionalcommits.org/).

## License

[MIT](LICENSE) © DataDave-Dev
