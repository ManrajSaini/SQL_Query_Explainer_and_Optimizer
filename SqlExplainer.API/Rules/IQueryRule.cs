using Microsoft.SqlServer.TransactSql.ScriptDom;
using SqlExplainer.API.Models;

namespace SqlExplainer.API.Rules;

public interface IQueryRule
{
    IEnumerable<Suggestion> Analyze(AstSummary summary, TSqlFragment fragment);
}
