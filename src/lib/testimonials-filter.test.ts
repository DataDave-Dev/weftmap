import { describe, expect, test } from "vitest";
import {
  filterSortTestimonials,
  type TestimonialItem,
} from "./testimonials-filter";

function make(over: Partial<TestimonialItem>): TestimonialItem {
  return {
    id: Math.random().toString(),
    body: "",
    rating: null,
    createdAt: 0,
    userName: null,
    userImage: null,
    userUsername: null,
    ...over,
  };
}

const items: TestimonialItem[] = [
  make({ id: "a", body: "Great tool", rating: 5, createdAt: 100 }),
  make({ id: "b", body: "It is okay", rating: 3, createdAt: 300 }),
  make({ id: "c", body: "Loved the graphs", rating: null, createdAt: 200 }),
];

const base = { q: "", sort: "newest" as const, minRating: 0 };

describe("filterSortTestimonials", () => {
  test("newest first by default", () => {
    const r = filterSortTestimonials(items, base);
    expect(r.map((x) => x.id)).toEqual(["b", "c", "a"]);
  });

  test("oldest first", () => {
    const r = filterSortTestimonials(items, { ...base, sort: "oldest" });
    expect(r.map((x) => x.id)).toEqual(["a", "c", "b"]);
  });

  test("top rated first, nulls last", () => {
    const r = filterSortTestimonials(items, { ...base, sort: "top" });
    expect(r.map((x) => x.id)).toEqual(["a", "b", "c"]);
  });

  test("search matches body case-insensitively", () => {
    const r = filterSortTestimonials(items, { ...base, q: "GRAPHS" });
    expect(r.map((x) => x.id)).toEqual(["c"]);
  });

  test("search matches author username", () => {
    const withUser = [make({ id: "u", userUsername: "octocat" }), ...items];
    const r = filterSortTestimonials(withUser, { ...base, q: "octo" });
    expect(r.map((x) => x.id)).toEqual(["u"]);
  });

  test("minRating excludes lower and unrated", () => {
    const r = filterSortTestimonials(items, { ...base, minRating: 4 });
    expect(r.map((x) => x.id)).toEqual(["a"]);
  });

  test("does not mutate the input array", () => {
    const copy = [...items];
    filterSortTestimonials(items, { ...base, sort: "oldest" });
    expect(items).toEqual(copy);
  });
});
