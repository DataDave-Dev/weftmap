import { describe, expect, test } from "vitest";
import { formatStars } from "./format";

describe("formatStars", () => {
  test("leaves counts under 1000 as-is", () => {
    expect(formatStars(0)).toBe("0");
    expect(formatStars(42)).toBe("42");
    expect(formatStars(999)).toBe("999");
  });

  test("compacts thousands with one decimal", () => {
    expect(formatStars(1200)).toBe("1.2k");
    expect(formatStars(15800)).toBe("15.8k");
  });

  test("drops a trailing .0", () => {
    expect(formatStars(1000)).toBe("1k");
    expect(formatStars(2000)).toBe("2k");
  });
});
