using Microsoft.SqlServer.TransactSql.ScriptDom;
using SqlExplainer.API.Models;

namespace SqlExplainer.API.Rules;

public class CartesianJoinRule : IQueryRule
{
    public IEnumerable<Suggestion> Analyze(AstSummary summary, TSqlFragment fragment)
    {
        var crossJoins = summary.Joins
            .Where(j => j.JoinType == "Cross").ToList();

        if (crossJoins.Any())
            yield return new Suggestion
            {
                Title = "Cartesian join detected",
                Description = $"Table '{crossJoins.First().Table}' is joined without " +
                               "an ON condition, producing a row for every combination.",
                Severity = "critical"
            };
    }
}
