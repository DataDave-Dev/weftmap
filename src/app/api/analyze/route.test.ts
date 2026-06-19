import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { POST } from "./route";
import { rateLimit } from "@/lib/rate-limit";
import { getAnalyzer } from "@/lib/analysis/registry";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/analysis/registry", () => ({
  getAnalyzer: vi.fn(),
  SUPPORTED_LANGUAGES: ["python", "javascript"],
}));

describe("POST /api/analyze", () => {
  const mockRateLimit = rateLimit as Mock;
  const mockGetAnalyzer = getAnalyzer as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default rate limit to allow the request
    mockRateLimit.mockReturnValue({ ok: true, remaining: 9, retryAfter: 0 });
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockRateLimit.mockReturnValue({ ok: false, remaining: 0, retryAfter: 45 });

    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify({ code: "print('hello')", language: "python" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("45");

    const data = await res.json();
    expect(data).toEqual({
      error: "Demasiadas solicitudes. Intenta de nuevo en un momento.",
    });
  });

  it("returns 400 when JSON body is invalid", async () => {
    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: "{invalid-json}",
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toEqual({ error: "JSON inválido" });
  });

  it("returns 400 when language is missing", async () => {
    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify({ code: "print('hello')" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toEqual({ error: "El campo 'language' es obligatorio." });
  });

  it("returns 400 when language is unsupported", async () => {
    mockGetAnalyzer.mockReturnValue(undefined);

    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify({ code: "print('hello')", language: "ruby" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("Lenguaje no soportado: ruby");
  });

  it("returns 400 when files array is empty", async () => {
    mockGetAnalyzer.mockReturnValue({
      language: "python",
      analyzeProject: vi.fn(),
    });

    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify({ files: [], language: "python" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toEqual({ error: "No se encontraron archivos analizables." });
  });

  it("returns 413 when files count exceeds limit", async () => {
    mockGetAnalyzer.mockReturnValue({
      language: "python",
      analyzeProject: vi.fn(),
    });

    // 401 mock files
    const tooManyFiles = Array.from({ length: 401 }, (_, i) => ({
      path: `file_${i}.py`,
      content: "print(1)",
    }));

    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify({ files: tooManyFiles, language: "python" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(413);

    const data = await res.json();
    expect(data).toEqual({ error: "Demasiados archivos (máx. 400)." });
  });

  it("returns 400 when files array elements are invalid format", async () => {
    mockGetAnalyzer.mockReturnValue({
      language: "python",
      analyzeProject: vi.fn(),
    });

    const invalidFiles = [
      { path: "valid.py", content: "print(1)" },
      { path: "invalid.py" }, // missing content
    ];

    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify({ files: invalidFiles, language: "python" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toEqual({ error: "Formato de archivos inválido." });
  });

  it("returns 413 when total payload size exceeds maximum limit", async () => {
    mockGetAnalyzer.mockReturnValue({
      language: "python",
      analyzeProject: vi.fn(),
    });

    // Code size: 2_000_001 bytes
    const hugeCode = "a".repeat(2_000_001);

    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify({ code: hugeCode, language: "python" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(413);

    const data = await res.json();
    expect(data).toEqual({
      error: "El código excede el límite de 2000000 bytes.",
    });
  });

  it("returns 400 when neither code nor files is provided", async () => {
    mockGetAnalyzer.mockReturnValue({
      language: "python",
      analyzeProject: vi.fn(),
    });

    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify({ language: "python" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toEqual({ error: "Envía 'code' o 'files'." });
  });

  it("successfully analyzes a single code snippet", async () => {
    const mockGraph = {
      nodes: [{ id: "n1", label: "main", type: "function" }],
      edges: [],
    };
    const mockAnalyzeProject = vi.fn().mockResolvedValue(mockGraph);

    mockGetAnalyzer.mockReturnValue({
      language: "python",
      analyzeProject: mockAnalyzeProject,
    });

    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify({
        code: "def main(): pass",
        language: "python",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual(mockGraph);
    expect(mockAnalyzeProject).toHaveBeenCalledWith([
      { path: "snippet.py", content: "def main(): pass" },
    ]);
  });

  it("successfully analyzes a project with files array", async () => {
    const mockGraph = {
      nodes: [{ id: "n1", label: "foo", type: "function" }],
      edges: [],
    };
    const mockAnalyzeProject = vi.fn().mockResolvedValue(mockGraph);

    mockGetAnalyzer.mockReturnValue({
      language: "python",
      analyzeProject: mockAnalyzeProject,
    });

    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify({
        files: [
          { path: "./sub/a.py", content: "def foo(): pass" },
          { path: "sub\\b.py", content: "def bar(): pass" },
        ],
        language: "python",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual(mockGraph);
    expect(mockAnalyzeProject).toHaveBeenCalledWith([
      { path: "sub/a.py", content: "def foo(): pass" },
      { path: "sub/b.py", content: "def bar(): pass" },
    ]);
  });

  it("returns 500 when analyzer throws an error", async () => {
    const mockAnalyzeProject = vi
      .fn()
      .mockRejectedValue(new Error("Parsing failed"));

    mockGetAnalyzer.mockReturnValue({
      language: "python",
      analyzeProject: mockAnalyzeProject,
    });

    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify({
        code: "def error(): pass",
        language: "python",
      }),
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await POST(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data).toEqual({ error: "No se pudo analizar el código." });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
