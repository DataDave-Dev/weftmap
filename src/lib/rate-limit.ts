// ponytail: in-memory per-instance fixed-window limiter. No external service.
// Good enough for single/few instances (Fluid Compute reuses them across
// requests); swap for @upstash/ratelimit if the app scales to many instances.

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const PRUNE_THRESHOLD = 10_000;

type Entry = { count: number; resetAt: number };

const hits = new Map<string, Entry>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfter: number; // whole seconds until the window resets (0 when ok)
};

function prune(now: number): void {
  for (const [key, entry] of hits) {
    if (now >= entry.resetAt) hits.delete(key);
  }
}

export function rateLimit(
  key: string,
  now: number = Date.now(),
  limit: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS,
): RateLimitResult {
  const entry = hits.get(key);

  if (!entry || now >= entry.resetAt) {
    if (hits.size > PRUNE_THRESHOLD) prune(now);
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { ok: true, remaining: limit - entry.count, retryAfter: 0 };
}
