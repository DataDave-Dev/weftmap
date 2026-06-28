import { describe, expect, test } from "vitest";
import { layout } from "./Diagram";
import type { Graph } from "@/lib/analysis/types";

describe("layout", () => {
  test("handles basic linear parent hierarchy without crashing", () => {
    const graph: Graph = {
      nodes: [
        { id: "root", label: "root", type: "module" },
        { id: "child", label: "child", type: "function", parent: "root" },
      ],
      edges: [],
    };
    const result = layout(graph, false);
    expect(result.nodes.length).toBe(2);
  });

  test("breaks out of parent reference cycles to avoid infinite loops and stack overflow", () => {
    // Node A's parent is B, and Node B's parent is A
    const graph: Graph = {
      nodes: [
        { id: "A", label: "Node A", type: "module", parent: "B" },
        { id: "B", label: "Node B", type: "module", parent: "A" },
      ],
      edges: [],
    };

    // This should run quickly and complete without throwing "Maximum call stack size exceeded"
    // or entering an infinite loop.
    const startTime = Date.now();
    const result = layout(graph, false);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(1000); // Must complete almost instantly
    expect(result.nodes.length).toBe(2);
  });
});
