# Weftmap

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Tree-sitter](https://img.shields.io/badge/Tree--sitter-WASM-green.svg)](https://tree-sitter.github.io/)

**🌐 Idioma:** [English](README.md) · **Español**

> Pega código y obtén un **call graph** interactivo para entender qué hace —
> en varios lenguajes, gracias a [Tree-sitter](https://tree-sitter.github.io/).

Weftmap convierte código fuente en un diagrama navegable de qué función llama a
cuál. El diferencial es una **arquitectura pluggable y multi-lenguaje**: el
backend adapta el análisis según el lenguaje, y agregar uno nuevo toma unas pocas
líneas. No existe una herramienta libre que haga esto bien para varios lenguajes
a la vez.

> **Estado:** MVP. Soporta **Python**, **JavaScript/TypeScript**, **Go**, **Rust** y **SQL**.
> Tipos de diagrama: call graph (funciones como nodos, llamadas como flechas) y,
> para SQL, entidad-relación (tablas como nodos, foreign keys como aristas).

---

## Tabla de contenidos

- [Características](#características)
- [Cómo funciona](#cómo-funciona)
- [Stack tecnológico](#stack-tecnológico)
- [Empezar](#empezar)
- [Scripts disponibles](#scripts-disponibles)
- [Agregar un lenguaje](#agregar-un-lenguaje)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Roadmap](#roadmap)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## Características

- **Multi-lenguaje** — un solo motor de parsing (Tree-sitter) para todos.
- **Pluggable** — un lenguaje es un `LangSpec` + dos queries de Tree-sitter.
- **Diagrama interactivo** — desplaza, haz zoom y arrastra nodos (React Flow +
  layout de dagre).
- **Call graph interno** — muestra llamadas entre funciones definidas en tu
  código; las llamadas a builtins/librerías se filtran para mantener el grafo útil.
- **Sin pasos de build para el usuario** — pega un snippet y presiona *Analizar*.

## Cómo funciona

```
┌──────────┐   POST /api/analyze   ┌─────────────────────┐   Graph JSON   ┌─────────────┐
│ Navegador│ ────────────────────▶ │  Tree-sitter (WASM) │ ─────────────▶ │  React Flow │
│ (textarea)│   { code, language }  │  módulo por lenguaje │  {nodes,edges} │  (dagre)    │
└──────────┘                       └─────────────────────┘                └─────────────┘
```

1. Pegas código y eliges un lenguaje.
2. El backend (`src/app/api/analyze/route.ts`) valida la entrada, parsea el
   código con el grammar de Tree-sitter correspondiente, y recorre el árbol de
   sintaxis para construir un grafo normalizado `{ nodes, edges }`.
3. El frontend lo acomoda con [dagre](https://github.com/dagrejs/dagre) y lo
   dibuja de forma interactiva con [React Flow](https://reactflow.dev/).

El call graph se extrae con **queries declarativas de Tree-sitter** (una para
definiciones de funciones, otra para llamadas) en vez de recorrer el AST a mano:
menos código, más fácil de mantener, y el mismo enfoque sirve para cada lenguaje.

## Stack tecnológico

| Capa | Elección | Por qué |
|------|----------|---------|
| Framework | Next.js (App Router) | Frontend + backend en un proyecto y un deploy |
| Lenguaje | TypeScript | Seguridad de tipos en todo el stack |
| Parsing | Tree-sitter vía `web-tree-sitter` (WASM) | Una sola API para ~40 lenguajes |
| Grammars | `tree-sitter-wasms` | Binarios de grammars preconstruidos |
| Diagrama | React Flow + dagre | Nodos interactivos, layout jerárquico |
| Tests | Vitest | Tests unitarios rápidos para los analyzers |
| Gestor de paquetes | pnpm | Instalaciones rápidas y eficientes en disco |

## Empezar

**Requisitos:** Node 20+ y [pnpm](https://pnpm.io/).

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar el servidor de desarrollo
pnpm dev
# abre http://localhost:3000
```

Pega un snippet, elige **python** o **javascript**, y presiona **Analizar**.

## Scripts disponibles

| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | Levanta el servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Corre el build de producción |
| `pnpm test` | Corre los tests de los analyzers (Vitest) |
| `pnpm typecheck` | Verifica tipos con `tsc --noEmit` |
| `pnpm lint` | Linting con ESLint |

## Agregar un lenguaje

Es el tipo de contribución más valioso. La arquitectura es *pluggable*: el
backend adapta el análisis según el lenguaje, y no hace falta tocar nada más.

1. **Agrega el grammar.** Copia `tree-sitter-<lang>.wasm` a `public/wasm/`
   (disponible en el paquete
   [`tree-sitter-wasms`](https://www.npmjs.com/package/tree-sitter-wasms)).
2. **Crea el analyzer.** Agrega `src/lib/analysis/analyzers/<lang>.ts` con un
   `LangSpec` — dos queries de Tree-sitter (definiciones y llamadas) más el
   conjunto de tipos de nodo que cuentan como función. Usa
   [`python.ts`](src/lib/analysis/analyzers/python.ts) como plantilla.
3. **Regístralo.** Agrega una línea en
   [`src/lib/analysis/registry.ts`](src/lib/analysis/registry.ts).
4. **Agrega la opción en la UI.** Suma la clave del lenguaje al arreglo
   `LANGUAGES` en [`src/app/page.tsx`](src/app/page.tsx).
5. **Agrega un test.** Un snippet → verificación de nodos/aristas esperados en
   `src/lib/analysis/analyzers/`.

Eso es todo.

## Estructura del proyecto

```
src/
  app/
    page.tsx                  # UI: textarea + selector de lenguaje + diagrama
    api/analyze/route.ts      # backend: valida la entrada, llama al analyzer
  components/
    CodeInput.tsx             # textarea + selector + botón de analizar
    Diagram.tsx               # render con React Flow + dagre
  lib/analysis/
    types.ts                  # contrato Graph + LanguageAnalyzer
    registry.ts               # registro de lenguajes (único que los conoce todos)
    treesitter.ts             # carga/cachea el runtime de Tree-sitter + grammars
    analyzers/
      shared.ts               # lógica común de extracción del call graph
      python.ts               # LangSpec de Python
      javascript.ts           # LangSpec de JS/TS
      analyzers.test.ts       # tests de los analyzers
public/wasm/                  # runtime de Tree-sitter + archivos .wasm de grammars
```

## Roadmap

¿Tienes una idea? [Abre un issue](https://github.com/DataDave-Dev/weftmap/issues/new/choose).
Las tareas para empezar están etiquetadas como [`good first issue`](https://github.com/DataDave-Dev/weftmap/issues?q=is%3Aopen+label%3A%22good+first+issue%22).

**Hecho**

- [x] Call graph para Python, JavaScript, TypeScript, Go y Rust
- [x] Diagramas de esquema SQL (ER / UML): tablas, columnas, PK/FK, relaciones
- [x] Arquitectura pluggable por lenguaje (añadir uno son pocas líneas)
- [x] UI bilingüe (en/es) con docs in-app

**Siguiente** — se busca ayuda

- [ ] Más lenguajes: Ruby ([#13](https://github.com/DataDave-Dev/weftmap/issues/13)), Java ([#14](https://github.com/DataDave-Dev/weftmap/issues/14))
- [ ] Derivar los chips de lenguajes del Hero desde el registro ([#15](https://github.com/DataDave-Dev/weftmap/issues/15))
- [ ] Ampliar la cobertura de tests de los analyzers ([#16](https://github.com/DataDave-Dev/weftmap/issues/16))
- [ ] Mejor estado vacío cuando no se encuentran funciones ([#17](https://github.com/DataDave-Dev/weftmap/issues/17))

**Más adelante**

- [ ] Modo proyecto: analizar una carpeta entera como un solo grafo
- [ ] Interacción en nodos: click para resaltar llamadores/llamados, panel de detalle
- [ ] Más tipos de diagrama: control-flow y dependencias entre módulos
- [ ] Exportar el grafo (PNG/SVG) y permalinks para compartir
- [ ] Más métodos de entrada: subir ZIP y URL de repo de GitHub
- [ ] Rendimiento para bases de código grandes

## Contribuir

Las contribuciones son bienvenidas — sobre todo nuevos lenguajes. Lee
[CONTRIBUTING.es.md](CONTRIBUTING.es.md) y nuestro [Código de Conducta](CODE_OF_CONDUCT.es.md).

Reglas rápidas: `main` está protegida (abre un PR, CI debe pasar, se requiere una
aprobación), y los commits siguen
[Conventional Commits](https://www.conventionalcommits.org/).

## Licencia

[MIT](LICENSE) © DataDave-Dev
