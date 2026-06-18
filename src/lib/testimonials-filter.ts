export type TestimonialItem = {
  id: string;
  body: string;
  rating: number | null;
  createdAt: Date | number;
  userName: string | null;
  userImage: string | null;
  userUsername: string | null;
};

export type SortKey = "newest" | "oldest" | "top";

export type FilterOptions = {
  q: string;
  sort: SortKey;
  minRating: number; // 0 = all
};

function time(value: Date | number): number {
  return value instanceof Date ? value.getTime() : value;
}

// Pure, client-safe filtering/sorting for the experiences board.
export function filterSortTestimonials(
  items: readonly TestimonialItem[],
  { q, sort, minRating }: FilterOptions,
): TestimonialItem[] {
  const needle = q.trim().toLowerCase();

  const filtered = items.filter((item) => {
    if (minRating > 0 && (item.rating ?? 0) < minRating) return false;
    if (!needle) return true;
    const haystack = [item.body, item.userName, item.userUsername]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });

  // Copy before sorting so the caller's array is never mutated.
  return [...filtered].sort((a, b) => {
    if (sort === "oldest") return time(a.createdAt) - time(b.createdAt);
    if (sort === "top") {
      const diff = (b.rating ?? 0) - (a.rating ?? 0); // nulls last
      return diff !== 0 ? diff : time(b.createdAt) - time(a.createdAt);
    }
    return time(b.createdAt) - time(a.createdAt); // newest
  });
}
