import "server-only";
import { REPO_SLUG } from "./constants";

// Repo star count, fetched server-side and cached for an hour. Returns null on
// any failure so the header degrades gracefully instead of breaking.
export async function getRepoStars(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_SLUG}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "weftmap",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}
