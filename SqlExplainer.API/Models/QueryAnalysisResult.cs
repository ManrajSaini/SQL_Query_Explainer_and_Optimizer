namespace SqlExplainer.API.Models;

public class QueryAnalysisResult
{
    public bool IsValid { get; set; }
    public List<string> ParseErrors { get; set; } = new();
    public List<Suggestion> Suggestions { get; set; } = new();
    public AstSummary? AstSummary { get; set; }
    public string? Explanation { get; set; }
    public List<PlanNode> ExecutionPlan { get; set; } = new();
    public string? ExecutionPlanError { get; set; }
}

public class AstSummary
{
    public string StatementType { get; set; } = string.Empty;
    public List<string> TablesReferenced { get; set; } = new();
    public List<string> ColumnsSelected { get; set; } = new();
    public List<JoinInfo> Joins { get; set; } = new();
    public bool HasWhereClause { get; set; }
    public bool HasGroupBy { get; set; }
    public bool HasOrderBy { get; set; }
    public bool HasSubqueries { get; set; }
}

public class JoinInfo
{
    public string JoinType { get; set; } = string.Empty;
    public string Table { get; set; } = string.Empty;
}

public class PlanNode
{
    public string Operation { get; set; } = string.Empty;
    public double? EstimatedCost { get; set; }
    public double? EstimatedRows { get; set; }
    public List<PlanNode> Children { get; set; } = new();
}
