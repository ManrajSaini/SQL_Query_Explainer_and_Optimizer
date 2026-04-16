using Microsoft.SqlServer.TransactSql.ScriptDom;
using SqlExplainer.API.Models;

namespace SqlExplainer.API.Services;

public class SqlParserService
{
    public (TSqlFragment? Fragment, List<string> Errors) Parse(string sql)
    {
        var parser = new TSql160Parser(initialQuotedIdentifiers: true);
        using var reader = new StringReader(sql);

        var fragment = parser.Parse(reader, out IList<ParseError> parseErrors);

        var errors = parseErrors.Select(e =>
            $"Line {e.Line}, Col {e.Column}: {e.Message}"
        ).ToList();

        return (errors.Count == 0 ? fragment : null, errors);
    }

    public AstSummary BuildSummary(TSqlFragment fragment)
    {
        var visitor = new QueryVisitor();
        fragment.Accept(visitor);

        return new AstSummary
        {
            StatementType = visitor.StatementType,
            TablesReferenced = visitor.Tables,
            ColumnsSelected = visitor.Columns,
            Joins = visitor.Joins,
            HasWhereClause = visitor.HasWhere,
            HasGroupBy = visitor.HasGroupBy,
            HasOrderBy = visitor.HasOrderBy,
            HasSubqueries = visitor.HasSubqueries
        };
    }
}
