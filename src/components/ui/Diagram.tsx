"use client";

import { useMemo } from "react";
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
import type { Graph, GraphNode } from "@/lib/analysis/types";

const NODE_W = 156;
const NODE_H = 40;
const HEADER = 30;
const PAD = 16;

const CALL_COLOR = "rgba(255,255,255,0.32)";
const IMPORT_COLOR = "#5eead4";

// Custom container node for a module/file: a header label + invisible handles
// so module-level edges (imports, top-level calls) can attach.
function ModuleNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="w-full h-full rounded-xl border border-white/15 bg-white/[0.025]">
      <div className="px-3 py-1.5 font-mono text-[11px] text-muted/90 border-b border-white/10 truncate">
        {data.label}
      </div>
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}

const nodeTypes = { module: ModuleNode };

const fnStyle = {
  width: NODE_W,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "#13151b",
  color: "#e6e9ef",
  fontFamily: "ui-monospace, monospace",
  fontSize: 13,
} as const;

type Layout = { nodes: Node[]; edges: Edge[] };

function layout(graph: Graph): Layout {
  const modules = graph.nodes.filter((n) => n.type === "module");
  const functions = graph.nodes.filter((n) => n.type === "function");

  const fnByModule = new Map<string, GraphNode[]>();
  for (const f of functions) {
    if (!f.parent) continue;
    const list = fnByModule.get(f.parent) ?? [];
    list.push(f);
    fnByModule.set(f.parent, list);
  }

  // Intra-module call edges drive each module's internal layout.
  const sameModuleEdges = graph.edges.filter(
    (e) =>
      e.kind === "calls" &&
      functions.some((f) => f.id === e.source) &&
      functions.some((f) => f.id === e.target) &&
      functions.find((f) => f.id === e.source)?.parent ===
        functions.find((f) => f.id === e.target)?.parent,
  );

  // 1. Sub-layout each module's functions; record relative child positions + size.
  const childRel = new Map<string, { x: number; y: number }>();
  const moduleSize = new Map<string, { w: number; h: number }>();

  for (const mod of modules) {
    const funcs = fnByModule.get(mod.id) ?? [];
    if (funcs.length === 0) {
      moduleSize.set(mod.id, { w: 200, h: HEADER + 14 });
      continue;
    }
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 24, ranksep: 40 });
    g.setDefaultEdgeLabel(() => ({}));
    funcs.forEach((f) => g.setNode(f.id, { width: NODE_W, height: NODE_H }));
    sameModuleEdges
      .filter((e) => funcs.some((f) => f.id === e.source))
      .forEach((e) => g.setEdge(e.source, e.target));
    dagre.layout(g);

    let maxX = 0;
    let maxY = 0;
    for (const f of funcs) {
      const { x, y } = g.node(f.id);
      const rx = x - NODE_W / 2 + PAD;
      const ry = y - NODE_H / 2 + HEADER + PAD;
      childRel.set(f.id, { x: rx, y: ry });
      maxX = Math.max(maxX, rx + NODE_W);
      maxY = Math.max(maxY, ry + NODE_H);
    }
    moduleSize.set(mod.id, { w: maxX + PAD, h: maxY + PAD });
  }

  // 2. Top-level layout of modules using imports + cross-module calls.
  const moduleOf = new Map<string, string>(); // fnId -> moduleId
  for (const f of functions) if (f.parent) moduleOf.set(f.id, f.parent);
  const moduleIds = new Set(modules.map((m) => m.id));

  const topEdges = new Set<string>();
  for (const e of graph.edges) {
    const src = moduleIds.has(e.source) ? e.source : moduleOf.get(e.source);
    const tgt = moduleIds.has(e.target) ? e.target : moduleOf.get(e.target);
    if (src && tgt && src !== tgt) topEdges.add(`${src}|${tgt}`);
  }

  const gg = new dagre.graphlib.Graph();
  gg.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 120 });
  gg.setDefaultEdgeLabel(() => ({}));
  for (const mod of modules) {
    const size = moduleSize.get(mod.id)!;
    gg.setNode(mod.id, { width: size.w, height: size.h });
  }
  for (const key of topEdges) {
    const [s, t] = key.split("|");
    gg.setEdge(s, t);
  }
  dagre.layout(gg);

  // 3. Compose React Flow nodes — modules (parents) first, then functions.
  const nodes: Node[] = [];
  for (const mod of modules) {
    const size = moduleSize.get(mod.id)!;
    const { x, y } = gg.node(mod.id);
    nodes.push({
      id: mod.id,
      type: "module",
      data: { label: mod.label },
      position: { x: x - size.w / 2, y: y - size.h / 2 },
      style: { width: size.w, height: size.h },
      selectable: false,
      draggable: false,
    });
  }
  for (const f of functions) {
    const rel = childRel.get(f.id);
    if (!rel || !f.parent) continue;
    nodes.push({
      id: f.id,
      data: { label: f.label },
      position: rel,
      parentNode: f.parent,
      extent: "parent",
      draggable: false,
      style: fnStyle,
    });
  }

  const edges: Edge[] = graph.edges.map((e, i) => {
    const isImport = e.kind === "imports";
    return {
      id: `e${i}`,
      source: e.source,
      target: e.target,
      animated: !isImport,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isImport ? IMPORT_COLOR : "#9aa3b2",
      },
      style: {
        stroke: isImport ? IMPORT_COLOR : CALL_COLOR,
        strokeDasharray: isImport ? "5 4" : undefined,
      },
    };
  });

  return { nodes, edges };
}

export default function Diagram({
  graph,
  emptyLabel,
}: {
  graph: Graph;
  emptyLabel: string;
}) {
  const { nodes, edges } = useMemo(() => layout(graph), [graph]);

  if (graph.nodes.length === 0) {
    return (
      <div className="grid place-items-center h-full text-sm text-muted">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.1}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="rgba(255,255,255,0.06)" gap={20} />
      <Controls showInteractive={false} />
      <Panel
        position="top-left"
        className="flex gap-4 rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-[11px] text-muted backdrop-blur"
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t" style={{ borderColor: CALL_COLOR }} />
          calls
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-4 border-t border-dashed"
            style={{ borderColor: IMPORT_COLOR }}
          />
          imports
        </span>
      </Panel>
    </ReactFlow>
  );
}
