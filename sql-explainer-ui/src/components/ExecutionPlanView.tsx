import type { PlanNode } from "../types";

interface Props {
  plan: PlanNode[];
  error?: string;
}

function PlanNodeItem({ node, depth = 0 }: { node: PlanNode; depth?: number }) {
  return (
    <div style={{ marginLeft: depth * 16 }} className="space-y-1">
      <div className="rounded border border-gray-700 bg-gray-900 px-3 py-2">
        <div className="text-sm font-semibold text-gray-100">
          {node.operation}
        </div>
        <div className="mt-1 text-xs text-gray-400">
          {node.estimatedCost !== undefined && (
            <span className="mr-3">Cost: {node.estimatedCost.toFixed(4)}</span>
          )}
          {node.estimatedRows !== undefined && (
            <span>Rows: {node.estimatedRows.toFixed(2)}</span>
          )}
        </div>
      </div>
      {node.children.map((child, i) => (
        <PlanNodeItem
          key={`${child.operation}-${i}`}
          node={child}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function ExecutionPlanView({ plan, error }: Props) {
  if (error) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-200">Execution Plan</h2>
        <div className="rounded border border-yellow-700 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-200">
          Could not load live SQL Server execution plan: {error}
        </div>
      </div>
    );
  }

  if (plan.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-200">Execution Plan</h2>
        <div className="rounded border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-400">
          No live execution plan available. Provide a SQL Server connection
          string to fetch one.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-200">Execution Plan</h2>
      <div className="space-y-2">
        {plan.map((node, i) => (
          <PlanNodeItem key={`${node.operation}-${i}`} node={node} />
        ))}
      </div>
    </div>
  );
}
