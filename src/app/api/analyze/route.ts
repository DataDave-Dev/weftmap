import { NextResponse } from "next/server";
import { getAnalyzer, SUPPORTED_LANGUAGES } from "@/lib/analysis/registry";
import { rateLimit } from "@/lib/rate-limit";
import type { SourceFile } from "@/lib/analysis/types";

// Needs the Node runtime (reads .wasm from the filesystem), not Edge.
export const runtime = "nodejs";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

const MAX_TOTAL_BYTES = 2_000_000;
const MAX_FILES = 400;

const EXT: Record<string, string> = {
  python: "py",
  javascript: "js",
  typescript: "ts",
  go: "go",
  rust: "rs",
  sql: "sql",
};

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.\//, "");
}

export async function POST(request: Request) {
  // Cheap guard first: this endpoint runs synchronous WASM parsing, so unbounded
  // parallel requests can saturate the process. Limit before doing any work.
  const limit = rateLimit(clientIp(request));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en un momento." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { code, files, language } = (body ?? {}) as {
    code?: unknown;
    files?: unknown;
    language?: unknown;
  };

  if (typeof language !== "string") {
    return NextResponse.json(
      { error: "El campo 'language' es obligatorio." },
      { status: 400 },
    );
  }

  const analyzer = getAnalyzer(language);
  if (!analyzer) {
    return NextResponse.json(
      {
        error: `Lenguaje no soportado: ${language}. Soportados: ${SUPPORTED_LANGUAGES.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  // Build the file set: either a project (files[]) or a single snippet (code).
  let sources: SourceFile[];
  if (Array.isArray(files)) {
    if (files.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron archivos analizables." },
        { status: 400 },
      );
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Demasiados archivos (máx. ${MAX_FILES}).` },
        { status: 413 },
      );
    }
    const valid = files.every(
      (f): f is SourceFile =>
        !!f &&
        typeof (f as SourceFile).path === "string" &&
        typeof (f as SourceFile).content === "string",
    );
    if (!valid) {
      return NextResponse.json(
        { error: "Formato de archivos inválido." },
        { status: 400 },
      );
    }
    sources = (files as SourceFile[]).map((f) => ({
      path: normalizePath(f.path),
      content: f.content,
    }));
  } else if (typeof code === "string" && code.trim() !== "") {
    sources = [{ path: `snippet.${EXT[language] ?? "txt"}`, content: code }];
  } else {
    return NextResponse.json(
      { error: "Envía 'code' o 'files'." },
      { status: 400 },
    );
  }

  const totalBytes = sources.reduce(
    (sum, f) => sum + Buffer.byteLength(f.content, "utf8"),
    0,
  );
  if (totalBytes > MAX_TOTAL_BYTES) {
    return NextResponse.json(
      { error: `El código excede el límite de ${MAX_TOTAL_BYTES} bytes.` },
      { status: 413 },
    );
  }

  try {
    const graph = await analyzer.analyzeProject(sources);
    return NextResponse.json(graph);
  } catch (err) {
    console.error("Error analyzing code:", err);
    return NextResponse.json(
      { error: "No se pudo analizar el código." },
      { status: 500 },
    );
  }
}
