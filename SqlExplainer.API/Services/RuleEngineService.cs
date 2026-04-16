using Microsoft.SqlServer.TransactSql.ScriptDom;
using SqlExplainer.API.Models;
using SqlExplainer.API.Rules;

namespace SqlExplainer.API.Services;

public class RuleEngineService
{
    private readonly List<IQueryRule> _rules;

    public RuleEngineService()
    {
        _rules = new List<IQueryRule>
        {
            new SelectStarRule(),
            new MissingWhereRule(),
            new CartesianJoinRule(),
        };
    }

    public List<Suggestion> Run(AstSummary summary, TSqlFragment fragment)
        => _rules.SelectMany(r => r.Analyze(summary, fragment)).ToList();
}
