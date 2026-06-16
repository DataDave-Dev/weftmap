# Contributing to Weftmap

**🌐 Language:** **English** · [Español](CONTRIBUTING.es.md)

Thanks for your interest! This guide covers the essentials.

## Setup

```bash
pnpm install
pnpm dev
```

## Before opening a PR

All of these must pass (it's what CI runs):

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Workflow

- `main` is protected: no direct pushes. Work on a branch and open a Pull Request.
- A PR needs CI green and at least one approval to merge.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.

## Adding a language

This is the most valuable kind of contribution. The steps are in the
[README](README.md#adding-a-language). Always include an analyzer test.

## Style

- TypeScript, no `any` in application code.
- Small, focused files.
- Handle errors; never silence them.
