using Microsoft.SqlServer.TransactSql.ScriptDom;
using SqlExplainer.API.Models;

namespace SqlExplainer.API.Services;

public class QueryVisitor : TSqlFragmentVisitor
{
    public string StatementType { get; private set; } = "UNKNOWN";
    public List<string> Tables { get; } = new();
    public List<string> Columns { get; } = new();
    public List<JoinInfo> Joins { get; } = new();
    public bool HasWhere { get; private set; }
    public bool HasGroupBy { get; private set; }
    public bool HasOrderBy { get; private set; }
    public bool HasSubqueries { get; private set; }

    public override void Visit(SelectStatement node)
        => StatementType = "SELECT";

    public override void Visit(NamedTableReference node)
        => Tables.Add(node.SchemaObject.BaseIdentifier.Value);

    public override void Visit(SelectStarExpression node)
        => Columns.Add("*");

    public override void Visit(SelectScalarExpression node)
    {
        if (node.ColumnName != null)
            Columns.Add(node.ColumnName.Value);
    }

    public override void Visit(WhereClause node)
        => HasWhere = true;

    public override void Visit(GroupByClause node)
        => HasGroupBy = true;

    public override void Visit(OrderByClause node)
        => HasOrderBy = true;

    public override void Visit(QualifiedJoin node)
    {
        Joins.Add(new JoinInfo
        {
            JoinType = node.QualifiedJoinType.ToString(),
            Table = (node.SecondTableReference as NamedTableReference)
                        ?.SchemaObject.BaseIdentifier.Value ?? "unknown"
        });
    }

    public override void Visit(ScalarSubquery node)
        => HasSubqueries = true;
}
