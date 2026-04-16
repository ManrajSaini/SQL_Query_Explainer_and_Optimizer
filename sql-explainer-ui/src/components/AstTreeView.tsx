import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import type { AstSummary, Suggestion } from "../types";
import { buildGraph, type GraphNodeData } from "../utils/buildGraphFromSummary";

interface Props {
  summary: AstSummary;
  suggestions: Suggestion[];
}

function BaseNode({
  data,
  className,
}: NodeProps<GraphNodeData> & { className: string }) {
  const visibleMeta = data.meta?.slice(0, 4) ?? [];
  const visibleHighlights = data.highlights?.slice(0, 3) ?? [];

  return (
    <div
      className={`min-w-52 max-w-64 rounded border border-black/10 px-4 py-3 text-left text-sm shadow ${className}`}
    >
      <div className="font-semibold leading-tight">{data.title}</div>
      {data.subtitle && (
        <div className="mt-1 text-xs opacity-80">{data.subtitle}</div>
      )}
      {visibleMeta.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleMeta.map((item) => (
            <span
              key={item}
              className="rounded bg-black/20 px-2 py-0.5 text-[11px] font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      )}
      {visibleHighlights.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {visibleHighlights.map((highlight) => (
            <div
              key={`${highlight.severity}-${highlight.label}`}
              className="flex items-center gap-2 rounded bg-black/20 px-2 py-1 text-[11px]"
            >
              <span
                className={`h-2 w-2 rounded-full ${severityDotClass(highlight.severity)}`}
              />
              <span className="truncate">{highlight.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatementNode(props: NodeProps<GraphNodeData>) {
  return <BaseNode {...props} className="bg-blue-700 text-white" />;
}

function ProjectionNode(props: NodeProps<GraphNodeData>) {
  return <BaseNode {...props} className="bg-cyan-700 text-white" />;
}

function TableNode(props: NodeProps<GraphNodeData>) {
  return <BaseNode {...props} className="bg-green-700 text-white" />;
}

function JoinNode(props: NodeProps<GraphNodeData>) {
  return <BaseNode {...props} className="bg-orange-600 text-white" />;
}

function ClauseNode(props: NodeProps<GraphNodeData>) {
  return <BaseNode {...props} className="bg-purple-700 text-white" />;
}

const nodeTypes = {
  statementNode: StatementNode,
  projectionNode: ProjectionNode,
  tableNode: TableNode,
  joinNode: JoinNode,
  clauseNode: ClauseNode,
};

export default function AstTreeView({ summary, suggestions }: Props) {
  const { nodes, edges } = buildGraph(summary, suggestions);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-200">Query Structure</h2>
      <div className="h-[30rem] w-full overflow-hidden rounded border border-gray-700 bg-gray-900">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background color="#334155" gap={24} />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
    </div>
  );
}

function severityDotClass(severity: Suggestion["severity"]) {
  switch (severity) {
    case "critical":
      return "bg-red-400";
    case "warning":
      return "bg-yellow-300";
    default:
      return "bg-blue-300";
  }
}
