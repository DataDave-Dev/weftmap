import { describe, expect, test } from "vitest";
import { DOC_COMPONENTS } from "@/components/docs/registry";
import { DOC_NAV, DOC_SLUGS } from "./docs";

describe("docs metadata", () => {
  test("derives DOC_SLUGS from the navigation order", () => {
    expect(DOC_SLUGS).toEqual(DOC_NAV.map((item) => item.slug));
  });

  test("keeps every navigation slug unique", () => {
    expect(new Set(DOC_SLUGS).size).toBe(DOC_SLUGS.length);
  });

  test("keeps doc component keys aligned with DOC_SLUGS", () => {
    expect(Object.keys(DOC_COMPONENTS).sort()).toEqual([...DOC_SLUGS].sort());
  });
});
