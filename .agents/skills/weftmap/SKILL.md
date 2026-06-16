```markdown
# weftmap Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you how to contribute to the `weftmap` codebase, a TypeScript project focused on code analysis and visualization. You'll learn the project's coding conventions, how to extend language support, develop new analysis features (including cross-file/project-level analysis), and enhance the diagram UI. The guide covers commit patterns, file organization, and practical workflows with step-by-step instructions and code examples.

## Coding Conventions

- **Language:** TypeScript
- **Framework:** None detected
- **File Naming:** camelCase (e.g., `analyzersRegistry.ts`)
- **Import Style:** Relative imports

  ```typescript
  import { analyzeFile } from './analyzeFile';
  ```

- **Export Style:** Named exports

  ```typescript
  // Good
  export function analyzeFile() { ... }

  // Also good
  export { analyzeFile, analyzeProject };
  ```

- **Commit Messages:** Conventional commits, using the `feat` prefix for features.

  ```
  feat: add cross-file class detection for TypeScript analyzer
  ```

## Workflows

### Extend Language Support

**Trigger:** When you want to add or improve support for a programming language in the code analysis engine (e.g., TypeScript, Go, cross-file analysis, class/method detection).

**Command:** `/add-language-support`

1. **Implement or update the analyzer** for the new/enhanced language in  
   `src/lib/analysis/analyzers/{language}.ts`.
2. **Update shared logic** if needed in  
   `src/lib/analysis/analyzers/shared.ts` or `src/lib/analysis/analyzers/jslike.ts`.
3. **Register the analyzer** in  
   `src/lib/analysis/registry.ts` (if applicable).
4. **Add or update tests** in  
   `src/lib/analysis/analyzers/analyzers.test.ts`.
5. **Update the API route** if necessary:  
   `src/app/api/analyze/route.ts`.
6. **Update UI components** to reflect new language options, diagrams, or filtering:  
   - `src/components/ui/CodeWorkspace.tsx`
   - `src/components/ui/Diagram.tsx`
7. **Add WASM grammar files** in `public/wasm/` (e.g., `tree-sitter-{language}.wasm`) if needed.
8. **Update language selector and samples** in the UI.

**Example:**
```typescript
// src/lib/analysis/analyzers/go.ts
export function analyzeGo(source: string) {
  // ...Go analysis logic
}
```

```typescript
// src/lib/analysis/registry.ts
import { analyzeGo } from './analyzers/go';
registry['go'] = analyzeGo;
```

### Feature Development with Cross-File Analysis

**Trigger:** When you want to add a new analysis capability, especially one that requires project-level or cross-file features (e.g., project-level graph, class/method detection, inheritance, cross-file calls).

**Command:** `/add-analysis-feature`

1. **Update or extend analysis model/types** in  
   `src/lib/analysis/types.ts`.
2. **Implement feature logic** in the relevant analyzers:  
   `src/lib/analysis/analyzers/{language}.ts`, `shared.ts`.
3. **Update the API** to expose the new analysis:  
   `src/app/api/analyze/route.ts`.
4. **Update UI components** to visualize the new feature:  
   - `src/components/ui/Diagram.tsx`
   - `src/components/ui/CodeWorkspace.tsx`
   - `src/components/ui/CodeTool.tsx`
5. **Update i18n dictionaries** if UI text changes:  
   `src/i18n/dictionaries/en.json`, `src/i18n/dictionaries/es.json`.
6. **Add or update tests** in  
   `src/lib/analysis/analyzers/analyzers.test.ts`.

**Example:**
```typescript
// src/lib/analysis/types.ts
export interface ClassNode {
  name: string;
  methods: string[];
  file: string;
}
```

```typescript
// src/lib/analysis/analyzers/typescript.ts
export function analyzeTypeScript(source: string, files: Record<string, string>) {
  // ...cross-file class/method detection logic
}
```

### Diagram UI Enhancement

**Trigger:** When you want to improve the diagram's layout, add new edge types, or enhance interactivity/filtering in the UI.

**Command:** `/improve-diagram-ui`

1. **Update diagram rendering logic** in  
   `src/components/ui/Diagram.tsx`.
2. **Update or add legend and filtering features** in the same file.
3. **Update analysis output or types** if new edge/node types are visualized:  
   - `src/lib/analysis/types.ts`
   - relevant analyzers
4. **Update tests** if diagram output is tested:  
   `src/lib/analysis/analyzers/analyzers.test.ts`.
5. **Update i18n dictionaries** if UI text changes:  
   `src/i18n/dictionaries/en.json`, `src/i18n/dictionaries/es.json`.

**Example:**
```typescript
// src/components/ui/Diagram.tsx
<Legend items={[{ type: 'inheritance', color: 'blue' }]} />
<Diagram edges={edges} nodes={nodes} filter={filterFn} />
```

## Testing Patterns

- **Test Framework:** Unknown (likely Jest or similar)
- **Test File Pattern:** `*.test.*` (e.g., `analyzers.test.ts`)
- **Test Location:**  
  `src/lib/analysis/analyzers/analyzers.test.ts`

**Example:**
```typescript
// src/lib/analysis/analyzers/analyzers.test.ts
import { analyzeTypeScript } from './typescript';

test('detects classes across files', () => {
  // ...test logic
});
```

## Commands

| Command                | Purpose                                                         |
|------------------------|-----------------------------------------------------------------|
| /add-language-support  | Add or enhance support for a programming language               |
| /add-analysis-feature  | Implement a new analysis feature (e.g., cross-file analysis)    |
| /improve-diagram-ui    | Enhance diagram visualization, layout, or interactivity         |
```
