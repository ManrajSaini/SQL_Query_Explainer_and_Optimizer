using Microsoft.SqlServer.TransactSql.ScriptDom;
using SqlExplainer.API.Models;

namespace SqlExplainer.API.Rules;

/// <summary>
/// Flags SELECT statements that have no WHERE clause, which typically cause full table scans.
/// </summary>
public class MissingWhereRule : IQueryRule
{
    public IEnumerable<Suggestion> Analyze(AstSummary summary, TSqlFragment fragment)
    {
        if (summary.StatementType == "SELECT"
            && !summary.HasWhereClause
            && summary.TablesReferenced.Count > 0)
            yield return new Suggestion
            {
                Title = "No WHERE clause detected",
                Description = "This query will perform a full table scan. " +
                              "Add a WHERE clause to filter rows early.",
                Severity = "critical"
            };
    }
}
