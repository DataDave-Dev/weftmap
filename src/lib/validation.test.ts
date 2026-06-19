import { describe, expect, test } from "vitest";
import {
  graphMetaSchema,
  graphSchema,
  sourceSchema,
  testimonialSchema,
} from "./validation";

describe("graphMetaSchema", () => {
  test("rejects an empty title", () => {
    const result = graphMetaSchema.safeParse({
      title: "  ",
      language: "python",
    });
    expect(result.success).toBe(false);
  });

  test("trims and accepts a valid meta", () => {
    const result = graphMetaSchema.safeParse({
      title: "  My graph  ",
      language: "python",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("My graph");
  });
});

describe("graphSchema", () => {
  test("accepts a graph with the known optional fields", () => {
    const result = graphSchema.safeParse({
      nodes: [{ id: "a", label: "a", type: "function", file: "x.py" }],
      edges: [{ source: "a", target: "b", kind: "calls", column: "id" }],
    });
    expect(result.success).toBe(true);
  });

  test("rejects when nodes is not an array", () => {
    const result = graphSchema.safeParse({ nodes: "nope", edges: [] });
    expect(result.success).toBe(false);
  });
});

describe("sourceSchema", () => {
  test("rejects when neither code nor files is provided", () => {
    const result = sourceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test("accepts a code snippet", () => {
    const result = sourceSchema.safeParse({ code: "print(1)" });
    expect(result.success).toBe(true);
  });

  test("accepts a non-empty file list", () => {
    const result = sourceSchema.safeParse({
      files: [{ path: "a.py", content: "print(1)" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("testimonialSchema", () => {
  test("rejects a too-short body", () => {
    expect(testimonialSchema.safeParse({ body: "hi" }).success).toBe(false);
  });

  test("accepts and trims a valid body with a rating", () => {
    const result = testimonialSchema.safeParse({
      body: "  great tool  ",
      rating: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe("great tool");
      expect(result.data.rating).toBe(5);
    }
  });

  test("rejects a missing or out-of-range rating", () => {
    expect(testimonialSchema.safeParse({ body: "great tool" }).success).toBe(
      false,
    );
    expect(
      testimonialSchema.safeParse({ body: "great tool", rating: 6 }).success,
    ).toBe(false);
  });
});
