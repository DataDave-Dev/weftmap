"use client";

import { useMemo, useState } from "react";
import { useIsDark } from "@/lib/use-theme";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Panel,
  Position,
  MarkerType,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import dagre from "@dagrejs/dagre";
import "reactflow/dist/style.css";
import type { Graph, GraphNode, TableColumn } from "@/lib/analysis/types";

const NODE_W = 156;
const NODE_H = 40;
const HEADER = 30;
const PAD = 16;

// Table (ER) node dimensions.
const TABLE_W = 232;
const TABLE_HEADER = 34;
const TABLE_ROW = 24;

const CALL_COLOR = "#64748b";
const IMPORT_COLOR = "#0d9488";
const EXTENDS_COLOR = "#7c3aed";
const REF_COLOR = "#ea580c";

const tableHeight = (cols: number) => TABLE_HEADER + cols * TABLE_ROW + 4;

// Container node for a module or class: header label + invisible handles so
// module/class-level edges (imports, top-level calls, extends) can attach.
function ContainerNode({ data }: NodeProps<{ label: string; kind: "module" | "class" }>) {
  const isClass = data.kind === "class";
  return (
    <div
      className={`w-full h-full rounded-xl border ${
        isClass
          ? "border-violet-300 bg-violet-500/[0.05] dark:border-violet-500/40"
          : "border-[#e2e8f0] bg-black/[0.02] dark:border-[#232a36] dark:bg-white/[0.02]"
      }`}
    >
      <div
        className={`px-3 py-1.5 font-mono text-[11px] border-b truncate ${
          isClass
            ? "text-violet-700 border-violet-200 dark:text-violet-300 dark:border-violet-500/30"
            : "text-[#475569] border-[#e2e8f0] dark:text-[#9aa6b8] dark:border-[#232a36]"
        }`}
      >
        {isClass ? `class ${data.label}` : data.label}
      </div>
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}

// Table node for ER / schema diagrams: header + a row per column with PK/FK badges.
function TableNode({ data }: NodeProps<{ label: string; columns: TableColumn[] }>) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm dark:border-[#232a36] dark:bg-[#12151c]" style={{ width: TABLE_W }}>
      <div className="border-b border-[#e2e8f0] bg-[#f1f5f9] px-3 py-2 font-mono text-[12px] font-semibold text-[#0f172a] dark:border-[#232a36] dark:bg-[#1a1f29] dark:text-[#e6e9ef]">
        {data.label}
      </div>
      <div>
        {data.columns.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-2 border-b border-[#eef1f5] px-3 text-[11px] last:border-0 dark:border-[#1f2430]"
            style={{ height: TABLE_ROW }}
          >
            <span className="flex w-9 shrink-0 gap-1 font-mono text-[9px] font-semibold">
              {c.pk && <span className="text-amber-600" title="Primary key">PK</span>}
              {c.fk && <span className="text-orange-500" title="Foreign key">FK</span>}
            </span>
            <span className="flex-1 truncate font-mono text-[#0f172a] dark:text-[#e6e9ef]">{c.name}</span>
            <span className="shrink-0 truncate font-mono text-[10px] text-[#94a3b8]">{c.type}</span>
          </div>
        ))}
      </div>
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  );
}

const nodeTypes = { container: ContainerNode, table: TableNode };

const fnStyle = {
  width: NODE_W,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontFamily: "ui-monospace, monospace",
  fontSize: 13,
  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
} as const;

const fnStyleDark = {
  ...fnStyle,
  border: "1px solid #2a3140",
  background: "#12151c",
  color: "#e6e9ef",
  boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
} as const;

const isContainer = (n: GraphNode) => n.type === "module" || n.type === "class";

type Layout = { nodes: Node[]; edges: Edge[] };

function layout(graph: Graph, dark: boolean): Layout {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const childrenOf = new Map<string, GraphNode[]>();
  const roots: GraphNode[] = [];
  for (const n of graph.nodes) {
    if (n.parent) {
      const list = childrenOf.get(n.parent) ?? [];
      list.push(n);
      childrenOf.set(n.parent, list);
    } else {
      roots.push(n);
    }
  }

  const sizeById = new Map<string, { w: number; h: number }>();
  const relById = new Map<string, { x: number; y: number }>();

  // Direct child of `container` that is, or contains, `nodeId`.
  function ancestorIn(nodeId: string, container: string): string | null {
    let cur: string | undefined = nodeId;
    while (cur) {
      const n = byId.get(cur);
      if (!n) return null;
      if (n.parent === container) return cur;
      cur = n.parent;
    }
    return null;
  }

  // Lay out a container's direct children (recursively) and return its size.
  function sizeOf(id: string): { w: number; h: number } {
    const node = byId.get(id)!;
    if (!isContainer(node)) return { w: NODE_W, h: NODE_H };
    const kids = childrenOf.get(id) ?? [];
    if (kids.length === 0) return { w: 200, h: HEADER + 14 };

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 24, ranksep: 40 });
    g.setDefaultEdgeLabel(() => ({}));
    for (const k of kids) {
      const s = sizeOf(k.id);
      sizeById.set(k.id, s);
      g.setNode(k.id, { width: s.w, height: s.h });
    }
    const seen = new Set<string>();
    for (const e of graph.edges) {
      if (e.kind === "imports") continue;
      const a = ancestorIn(e.source, id);
      const b = ancestorIn(e.target, id);
      if (a && b && a !== b && !seen.has(`${a}|${b}`)) {
        seen.add(`${a}|${b}`);
        g.setEdge(a, b);
      }
    }
    dagre.layout(g);

    let maxX = 0;
    let maxY = 0;
    for (const k of kids) {
      const s = sizeById.get(k.id)!;
      const { x, y } = g.node(k.id);
      const rx = x - s.w / 2 + PAD;
      const ry = y - s.h / 2 + HEADER + PAD;
      relById.set(k.id, { x: rx, y: ry });
      maxX = Math.max(maxX, rx + s.w);
      maxY = Math.max(maxY, ry + s.h);
    }
    return { w: maxX + PAD, h: maxY + PAD };
  }

  for (const m of roots) {
    sizeById.set(
      m.id,
      m.type === "table"
        ? { w: TABLE_W, h: tableHeight(m.columns?.length ?? 0) }
        : sizeOf(m.id),
    );
  }

  // Top-level layout of modules (imports + cross-module calls/extends).
  const topAncestor = (nodeId: string): string | null => {
    let cur: string | undefined = nodeId;
    while (cur) {
      const n = byId.get(cur);
      if (!n) return null;
      if (!n.parent) return cur;
      cur = n.parent;
    }
    return null;
  };

  const gg = new dagre.graphlib.Graph();
  gg.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 120 });
  gg.setDefaultEdgeLabel(() => ({}));
  for (const m of roots) {
    const s = sizeById.get(m.id)!;
    gg.setNode(m.id, { width: s.w, height: s.h });
  }
  const topSeen = new Set<string>();
  for (const e of graph.edges) {
    const a = topAncestor(e.source);
    const b = topAncestor(e.target);
    if (a && b && a !== b && !topSeen.has(`${a}|${b}`)) {
      topSeen.add(`${a}|${b}`);
      gg.setEdge(a, b);
    }
  }
  dagre.layout(gg);

  const depthOf = (n: GraphNode): number => {
    let d = 0;
    let cur = n.parent;
    while (cur) {
      d++;
      cur = byId.get(cur)?.parent;
    }
    return d;
  };

  // Parents must precede children in the array.
  const ordered = [...graph.nodes].sort((a, b) => depthOf(a) - depthOf(b));

  const nodes: Node[] = ordered.map((n) => {
    const size = sizeById.get(n.id) ?? { w: NODE_W, h: NODE_H };
    const position = n.parent
      ? (relById.get(n.id) ?? { x: 0, y: 0 })
      : (() => {
          const { x, y } = gg.node(n.id);
          return { x: x - size.w / 2, y: y - size.h / 2 };
        })();

    if (isContainer(n)) {
      return {
        id: n.id,
        type: "container",
        data: { label: n.label, kind: n.type },
        position,
        style: { width: size.w, height: size.h },
        parentNode: n.parent,
        extent: n.parent ? ("parent" as const) : undefined,
        selectable: false,
        draggable: false,
      };
    }
    if (n.type === "table") {
      return {
        id: n.id,
        type: "table",
        data: { label: n.label, columns: n.columns ?? [] },
        position,
        style: { width: size.w },
      };
    }
    return {
      id: n.id,
      data: { label: n.label },
      position,
      parentNode: n.parent,
      extent: n.parent ? ("parent" as const) : undefined,
      draggable: false,
      style: dark ? fnStyleDark : fnStyle,
    };
  });

  const edgeColor = (kind: string) =>
    kind === "imports"
      ? IMPORT_COLOR
      : kind === "extends"
        ? EXTENDS_COLOR
        : kind === "references"
          ? REF_COLOR
          : CALL_COLOR;

  const edges: Edge[] = graph.edges.map((e, i) => ({
    id: `e${i}`,
    source: e.source,
    target: e.target,
    data: { kind: e.kind },
    animated: e.kind === "calls",
    label: e.kind === "references" ? e.cardinality : undefined,
    labelStyle: { fill: REF_COLOR, fontSize: 10, fontFamily: "ui-monospace, monospace" },
    labelBgStyle: { fill: "#ffffff" },
    markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor(e.kind) },
    style: {
      stroke: edgeColor(e.kind),
      strokeWidth: 1.75,
      strokeDasharray: e.kind === "calls" ? undefined : "5 4",
    },
  }));

  return { nodes, edges };
}

const LEGEND: { color: string; label: string; dashed: boolean }[] = [
  { color: CALL_COLOR, label: "calls", dashed: false },
  { color: IMPORT_COLOR, label: "imports", dashed: true },
  { color: EXTENDS_COLOR, label: "extends", dashed: true },
  { color: REF_COLOR, label: "references", dashed: true },
];

export default function Diagram({
  graph,
  emptyLabel,
}: {
  graph: Graph;
  emptyLabel: string;
}) {
  const dark = useIsDark();
  const { nodes, edges } = useMemo(() => layout(graph, dark), [graph, dark]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const legend = useMemo(() => {
    const present = new Set(graph.edges.map((e) => e.kind));
    return LEGEND.filter((l) => present.has(l.label as Graph["edges"][number]["kind"]));
  }, [graph]);

  const shownEdges = useMemo(
    () => edges.filter((e) => !hidden.has((e.data as { kind: string }).kind)),
    [edges, hidden],
  );

  const toggle = (kind: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });

  if (graph.nodes.length === 0) {
    return (
      <div className="grid place-items-center h-full text-sm text-[#64748b] dark:text-[#7c8696]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={shownEdges}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.1}
      proOptions={{ hideAttribution: true }}
    >
      <Background color={dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.07)"} gap={20} />
      <Controls showInteractive={false} />
      <Panel
        position="top-left"
        className="flex gap-2 rounded-lg border border-[#e2e8f0] bg-white/90 px-2 py-1.5 text-[11px] text-[#475569] shadow-sm backdrop-blur dark:border-[#232a36] dark:bg-[#12151c]/90 dark:text-[#9aa6b8]"
      >
        {legend.map((l) => {
          const off = hidden.has(l.label);
          return (
            <button
              key={l.label}
              onClick={() => toggle(l.label)}
              aria-pressed={!off}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-[#f1f5f9] dark:hover:bg-[#1a1f29] ${
                off ? "opacity-35 line-through" : "text-[#475569] dark:text-[#9aa6b8]"
              }`}
            >
              <span
                className={`inline-block w-4 border-t ${l.dashed ? "border-dashed" : ""}`}
                style={{ borderColor: l.color }}
              />
              {l.label}
            </button>
          );
        })}
      </Panel>
    </ReactFlow>
  );
}
