import dagre from "dagre";
import type { Edge, Node } from "reactflow";
import type { AstSummary, Suggestion } from "../types";

export type GraphNodeData = {
  title: string;
  subtitle?: string;
  meta?: string[];
  highlights?: Array<{
    label: string;
    severity: Suggestion["severity"];
  }>;
};

export function buildGraph(
  summary: AstSummary,
  suggestions: Suggestion[],
): {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<GraphNodeData>[] = [];
  const edges: Edge[] = [];
  let idCounter = 0;

  const nextId = () => `node-${idCounter++}`;
  const highlightMap = buildHighlightMap(suggestions);

  const addNode = (
    type: Node<GraphNodeData>["type"],
    data: GraphNodeData,
  ): string => {
    const nodeId = nextId();
    nodes.push({
      id: nodeId,
      data,
      type,
      position: { x: 0, y: 0 },
    });
    return nodeId;
  };

  const addEdge = (source: string, target: string, label?: string) => {
    edges.push({
      id: `e-${source}-${target}`,
      source,
      target,
      label,
      animated: false,
    });
  };

  const rootId = addNode("statementNode", {
    title: `${summary.statementType} Statement`,
    subtitle: "Query root",
    meta: [
      `${summary.tablesReferenced.length} table(s)`,
      `${summary.joins.length} join(s)`,
    ],
    highlights: highlightMap.statement,
  });

  if (summary.columnsSelected.length > 0) {
    const projectionId = addNode("projectionNode", {
      title: "Projection",
      subtitle: `${summary.columnsSelected.length} selected column(s)`,
      meta: summary.columnsSelected.slice(0, 5),
      highlights: highlightMap.projection,
    });
    addEdge(rootId, projectionId, "select");
  }

  let currentSourceId = rootId;

  if (summary.tablesReferenced.length > 0) {
    const baseTable = summary.tablesReferenced[0];
    const baseTableId = addNode("tableNode", {
      title: baseTable,
      subtitle: "Base table",
      meta: summary.columnsSelected
        .filter((column) => column !== "*")
        .slice(0, 3)
        .map((column) => `uses ${column}`),
      highlights: highlightMap.table,
    });
    addEdge(rootId, baseTableId, "from");
    currentSourceId = baseTableId;
  }

  summary.joins.forEach((join, index) => {
    const joinId = addNode("joinNode", {
      title: `${join.joinType} JOIN`,
      subtitle: index === 0 ? "First join" : `Join step ${index + 1}`,
      meta: [join.table],
      highlights: highlightMap.join,
    });

    addEdge(currentSourceId, joinId, "join");

    const joinedTableId = addNode("tableNode", {
      title: join.table,
      subtitle: "Joined table",
      highlights: highlightMap.table,
    });
    addEdge(joinId, joinedTableId, "table");

    currentSourceId = joinedTableId;
  });

  const clauses = [
    {
      condition: summary.hasWhereClause,
      title: "WHERE Filter",
      subtitle: "Row filtering",
      highlights: highlightMap.where,
    },
    {
      condition: summary.hasGroupBy,
      title: "GROUP BY",
      subtitle: "Aggregation stage",
      highlights: highlightMap.groupBy,
    },
    {
      condition: summary.hasOrderBy,
      title: "ORDER BY",
      subtitle: "Sort stage",
      highlights: highlightMap.orderBy,
    },
    {
      condition: summary.hasSubqueries,
      title: "Subquery",
      subtitle: "Nested query detected",
      highlights: highlightMap.subquery,
    },
  ];

  clauses
    .filter((clause) => clause.condition)
    .forEach((clause) => {
      const clauseId = addNode("clauseNode", {
        title: clause.title,
        subtitle: clause.subtitle,
        highlights: clause.highlights,
      });
      addEdge(currentSourceId, clauseId, "then");
      currentSourceId = clauseId;
    });

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", ranksep: 90, nodesep: 36 });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: 220, height: 96 });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  nodes.forEach((node) => {
    const position = graph.node(node.id);
    node.position = { x: position.x - 110, y: position.y - 48 };
  });

  return { nodes, edges };
}

function buildHighlightMap(suggestions: Suggestion[]) {
  const empty: GraphNodeData["highlights"] = [];

  const map = {
    statement: [...empty],
    projection: [...empty],
    table: [...empty],
    join: [...empty],
    where: [...empty],
    groupBy: [...empty],
    orderBy: [...empty],
    subquery: [...empty],
  };

  suggestions.forEach((suggestion) => {
    const text = `${suggestion.title} ${suggestion.description}`.toLowerCase();
    const highlight = {
      label: suggestion.title,
      severity: suggestion.severity,
    };

    map.statement.push(highlight);

    if (text.includes("select *") || text.includes("columns")) {
      map.projection.push(highlight);
    }

    if (text.includes("join") || text.includes("cartesian")) {
      map.join.push(highlight);
    }

    if (
      text.includes("where") ||
      text.includes("filter") ||
      text.includes("scan")
    ) {
      map.where.push(highlight);
      map.table.push(highlight);
    }

    if (text.includes("group by") || text.includes("aggregate")) {
      map.groupBy.push(highlight);
    }

    if (text.includes("order by") || text.includes("sort")) {
      map.orderBy.push(highlight);
    }

    if (text.includes("subquery")) {
      map.subquery.push(highlight);
    }
  });

  return map;
}
