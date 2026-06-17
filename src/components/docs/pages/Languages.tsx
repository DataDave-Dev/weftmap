import type { Locale } from "@/i18n/config";
import { H1, Lead, H2, UL, LI, Code, Callout } from "../Prose";

type Row = { lang: string; fns: boolean; classes: boolean; imports: boolean; extends: boolean };

const ROWS: Row[] = [
  { lang: "Python", fns: true, classes: true, imports: true, extends: true },
  { lang: "JavaScript", fns: true, classes: true, imports: true, extends: true },
  { lang: "TypeScript", fns: true, classes: true, imports: true, extends: true },
  { lang: "Go", fns: true, classes: false, imports: false, extends: false },
  { lang: "Rust", fns: true, classes: false, imports: false, extends: false },
];

function Cell({ on }: { on: boolean }) {
  return (
    <td className="px-3 py-2.5 text-center">
      {on ? (
        <span className="text-teal-600">✓</span>
      ) : (
        <span className="text-[#cbd5e1]">—</span>
      )}
    </td>
  );
}

function Matrix({ headers }: { headers: string[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-[#e2e8f0] dark:border-[#232a36]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e2e8f0] dark:border-[#232a36] text-left text-[12px] uppercase tracking-wide text-[#64748b] dark:text-[#7c8696]">
            <th className="px-3 py-2.5 font-medium">{headers[0]}</th>
            <th className="px-3 py-2.5 text-center font-medium">{headers[1]}</th>
            <th className="px-3 py-2.5 text-center font-medium">{headers[2]}</th>
            <th className="px-3 py-2.5 text-center font-medium">{headers[3]}</th>
            <th className="px-3 py-2.5 text-center font-medium">{headers[4]}</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.lang} className="border-b border-[#eef1f5] last:border-0">
              <td className="px-3 py-2.5 font-mono text-[13px] text-[#0f172a] dark:text-[#e6e9ef]">{r.lang}</td>
              <Cell on={r.fns} />
              <Cell on={r.classes} />
              <Cell on={r.imports} />
              <Cell on={r.extends} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Languages({ lang }: { lang: Locale }) {
  if (lang === "es") {
    return (
      <>
        <H1>Lenguajes</H1>
        <Lead>
          Weftmap soporta seis lenguajes hoy. La arquitectura es ampliable: cada
          lenguaje es una gramática de tree-sitter más un conjunto de consultas.
          Cinco generan un <strong>call graph</strong>; SQL genera un diagrama
          <strong> entidad-relación</strong>.
        </Lead>

        <Matrix headers={["Lenguaje", "Funciones", "Clases", "Imports", "Herencia"]} />

        <H2>Notas por lenguaje</H2>
        <UL>
          <LI><strong>Python</strong> — funciones, clases y métodos; resuelve <Code>import</Code> y <Code>from … import</Code> (incluidos relativos) y la herencia entre clases.</LI>
          <LI><strong>JavaScript</strong> — funciones (incluidas arrow asignadas), clases y métodos; imports ES relativos (<Code>./x</Code>) y <Code>extends</Code>.</LI>
          <LI><strong>TypeScript</strong> — igual que JavaScript pero con la gramática dedicada, así las anotaciones de tipos se parsean sin problemas.</LI>
          <LI><strong>Go</strong> — funciones y métodos. Go no tiene clases, así que no hay nodos de clase ni herencia.</LI>
          <LI><strong>Rust</strong> — funciones y llamadas. La resolución entre archivos usa definiciones únicas.</LI>
          <LI><strong>SQL</strong> — diagrama ER a partir de DDL (<Code>CREATE TABLE</Code>, <Code>ALTER TABLE</Code>): tablas con columnas y tipos, claves PK/FK, relaciones por foreign key con cardinalidad (1:1, 1:N y N:M vía tablas puente). Orientado a PostgreSQL.</LI>
        </UL>

        <Callout kind="warn">
          En Go y Rust los imports son por paquete o módulo (no por archivo), así que no se dibujan
          aristas de import. Las llamadas entre archivos del mismo paquete sí se
          resuelven por nombre. SQL es un tipo de diagrama distinto: en lugar de
          funciones y llamadas, dibuja tablas y relaciones.
        </Callout>
      </>
    );
  }

  return (
    <>
      <H1>Languages</H1>
      <Lead>
        Weftmap supports six languages today. The architecture is extensible: each
        language is a tree-sitter grammar plus a set of queries. Five produce a
        <strong> call graph</strong>; SQL produces an{" "}
        <strong>entity-relationship</strong> diagram.
      </Lead>

      <Matrix headers={["Language", "Functions", "Classes", "Imports", "Inheritance"]} />

      <H2>Per-language notes</H2>
      <UL>
        <LI><strong>Python</strong> — functions, classes and methods; resolves <Code>import</Code> and <Code>from … import</Code> (including relative) and class inheritance.</LI>
        <LI><strong>JavaScript</strong> — functions (including assigned arrow functions), classes and methods; relative ES imports (<Code>./x</Code>) and <Code>extends</Code>.</LI>
        <LI><strong>TypeScript</strong> — same as JavaScript but with the dedicated grammar, so type annotations parse cleanly.</LI>
        <LI><strong>Go</strong> — functions and methods. Go has no classes, so there are no class nodes or inheritance.</LI>
        <LI><strong>Rust</strong> — functions and calls. Cross-file resolution uses unique definitions.</LI>
        <LI><strong>SQL</strong> — ER diagram from DDL (<Code>CREATE TABLE</Code>, <Code>ALTER TABLE</Code>): tables with columns and types, PK/FK keys, and foreign-key relationships with cardinality (1:1, 1:N, and N:M via junction tables). PostgreSQL-oriented.</LI>
      </UL>

      <Callout kind="warn">
        In Go and Rust, imports are package- or module-based (not file-based), so import edges are not
        drawn. Calls between files in the same package are still resolved by name.
        SQL is a different diagram type: instead of functions and calls, it draws
        tables and relationships.
      </Callout>
    </>
  );
}
