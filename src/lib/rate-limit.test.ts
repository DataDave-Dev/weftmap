import { describe, it, expect } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows requests up to the limit, then blocks with Retry-After", () => {
    const key = "ip-allow-then-block";
    const t0 = 1_000_000;

    for (let i = 0; i < 10; i++) {
      const r = rateLimit(key, t0, 10, 60_000);
      expect(r.ok).toBe(true);
      expect(r.remaining).toBe(10 - (i + 1));
    }

    const blocked = rateLimit(key, t0 + 10_000, 10, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBe(50); // 60s window - 10s elapsed
  });

  it("resets after the window elapses", () => {
    const key = "ip-window-reset";
    const t0 = 2_000_000;

    rateLimit(key, t0, 1, 60_000); // consumes the only slot
    expect(rateLimit(key, t0, 1, 60_000).ok).toBe(false);

    const afterWindow = rateLimit(key, t0 + 60_000, 1, 60_000);
    expect(afterWindow.ok).toBe(true);
  });

  it("tracks keys independently", () => {
    const t0 = 3_000_000;
    expect(rateLimit("ip-a", t0, 1, 60_000).ok).toBe(true);
    expect(rateLimit("ip-a", t0, 1, 60_000).ok).toBe(false);
    expect(rateLimit("ip-b", t0, 1, 60_000).ok).toBe(true);
  });
});
