---
name: extend-language-support
description: Workflow command scaffold for extend-language-support in codeviz.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /extend-language-support

Use this workflow when working on **extend-language-support** in `codeviz`.

## Goal

Adds or enhances support for a programming language in the code analysis engine, including analyzers, test coverage, UI selectors, and registry integration.

## Common Files

- `src/lib/analysis/analyzers/{language}.ts`
- `src/lib/analysis/analyzers/shared.ts`
- `src/lib/analysis/analyzers/jslike.ts`
- `src/lib/analysis/registry.ts`
- `src/lib/analysis/analyzers/analyzers.test.ts`
- `src/app/api/analyze/route.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Implement or update analyzer for the new or enhanced language in src/lib/analysis/analyzers/{language}.ts
- Update shared analyzer logic in src/lib/analysis/analyzers/shared.ts or src/lib/analysis/analyzers/jslike.ts
- Register the new analyzer in src/lib/analysis/registry.ts (if applicable)
- Add or update tests in src/lib/analysis/analyzers/analyzers.test.ts
- Update API route if necessary (src/app/api/analyze/route.ts)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.