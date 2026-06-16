# Contribuir a Weftmap

**🌐 Idioma:** [English](CONTRIBUTING.md) · **Español**

¡Gracias por tu interés! Esta guía cubre lo esencial.

## Setup

```bash
pnpm install
pnpm dev
```

## Antes de abrir un PR

Todo esto debe pasar (es lo que corre CI):

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Flujo

- `main` está protegida: no se puede hacer push directo. Trabaja en una rama y
  abre un Pull Request.
- El PR necesita CI en verde y al menos una aprobación para mergear.
- Commits en formato [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.

## Agregar un lenguaje

Es el tipo de contribución más valioso. Los pasos están en el
[README](README.es.md#agregar-un-lenguaje). Incluye siempre un test del analyzer.

## Estilo

- TypeScript, sin `any` en código de aplicación.
- Archivos pequeños y enfocados.
- Maneja los errores; no los silencies.
