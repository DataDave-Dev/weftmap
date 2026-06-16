---
name: feature-development-with-cross-file-analysis
description: Workflow command scaffold for feature-development-with-cross-file-analysis in codeviz.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-development-with-cross-file-analysis

Use this workflow when working on **feature-development-with-cross-file-analysis** in `codeviz`.

## Goal

Implements a new analysis feature that requires changes across analyzers, UI, API, and tests, especially for cross-file/project-level capabilities.

## Common Files

- `src/lib/analysis/types.ts`
- `src/lib/analysis/analyzers/{language}.ts`
- `src/lib/analysis/analyzers/shared.ts`
- `src/app/api/analyze/route.ts`
- `src/components/ui/Diagram.tsx`
- `src/components/ui/CodeWorkspace.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Update or extend analysis model/types in src/lib/analysis/types.ts
- Implement feature logic in relevant analyzers (src/lib/analysis/analyzers/{language}.ts, shared.ts)
- Update API to expose new analysis (src/app/api/analyze/route.ts)
- Update UI components to visualize new feature (src/components/ui/Diagram.tsx, src/components/ui/CodeWorkspace.tsx, src/components/ui/CodeTool.tsx)
- Update i18n dictionaries if UI text changes (src/i18n/dictionaries/*.json)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.