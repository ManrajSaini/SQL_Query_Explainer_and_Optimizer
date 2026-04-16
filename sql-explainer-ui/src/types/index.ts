export interface Suggestion {
  title: string;
  description: string;
  fixSnippet?: string;
  severity: "info" | "warning" | "critical";
}

export interface JoinInfo {
  joinType: string;
  table: string;
}

export interface AstSummary {
  statementType: string;
  tablesReferenced: string[];
  columnsSelected: string[];
  joins: JoinInfo[];
  hasWhereClause: boolean;
  hasGroupBy: boolean;
  hasOrderBy: boolean;
  hasSubqueries: boolean;
}

export interface QueryAnalysisResult {
  isValid: boolean;
  parseErrors: string[];
  suggestions: Suggestion[];
  astSummary?: AstSummary;
  explanation?: string;
  executionPlan: PlanNode[];
  executionPlanError?: string;
}

export interface PlanNode {
  operation: string;
  estimatedCost?: number;
  estimatedRows?: number;
  children: PlanNode[];
}
