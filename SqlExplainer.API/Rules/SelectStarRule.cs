using Microsoft.SqlServer.TransactSql.ScriptDom;
using SqlExplainer.API.Models;

namespace SqlExplainer.API.Rules;

/// <summary>
/// Flags SELECT * usage which retrieves unnecessary columns and prevents covering index use.
/// </summary>
public class SelectStarRule : IQueryRule
{
    public IEnumerable<Suggestion> Analyze(AstSummary summary, TSqlFragment fragment)
    {
        if (summary.ColumnsSelected.Contains("*"))
            yield return new Suggestion
            {
                Title = "Avoid SELECT *",
                Description = "Selecting all columns transfers unnecessary data. " +
                              "Explicitly list the columns you need.",
                FixSnippet = "SELECT col1, col2, col3 FROM ...",
                Severity = "warning"
            };
    }
}
