using System.Xml.Linq;
using Microsoft.Data.SqlClient;
using SqlExplainer.API.Models;

namespace SqlExplainer.API.Services;

public class ExecutionPlanService
{
    public async Task<string> GetXmlPlanAsync(string connectionString, string sql)
    {
        await using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();

        await using var enableCmd = conn.CreateCommand();
        enableCmd.CommandText = "SET SHOWPLAN_XML ON";
        await enableCmd.ExecuteNonQueryAsync();

        try
        {
            await using var queryCmd = conn.CreateCommand();
            queryCmd.CommandText = sql;

            var xmlPlan = string.Empty;
            await using var reader = await queryCmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
                xmlPlan = reader.GetString(0);

            return xmlPlan;
        }
        finally
        {
            await using var disableCmd = conn.CreateCommand();
            disableCmd.CommandText = "SET SHOWPLAN_XML OFF";
            await disableCmd.ExecuteNonQueryAsync();
        }
    }

    public List<PlanNode> ParseXmlPlan(string xmlPlan)
    {
        if (string.IsNullOrWhiteSpace(xmlPlan))
            return [];

        var doc = XDocument.Parse(xmlPlan);
        var ns = doc.Root?.GetDefaultNamespace();

        if (ns == null)
            return [];

        var relOp = doc.Descendants(ns + "RelOp").FirstOrDefault();
        if (relOp == null)
            return [];

        return [ParseRelOp(relOp, ns)];
    }

    private static PlanNode ParseRelOp(XElement relOp, XNamespace ns)
    {
        var node = new PlanNode
        {
            Operation = relOp.Attribute("PhysicalOp")?.Value
                        ?? relOp.Attribute("LogicalOp")?.Value
                        ?? "Unknown",
            EstimatedCost = ParseDouble(relOp.Attribute("EstimatedTotalSubtreeCost")?.Value),
            EstimatedRows = ParseDouble(relOp.Attribute("EstimateRows")?.Value)
        };

        var childRelOps = relOp
            .Descendants(ns + "RelOp")
            .Where(child => child != relOp)
            .Where(child => child.Ancestors(ns + "RelOp").FirstOrDefault() == relOp)
            .ToList();

        node.Children = childRelOps
            .Select(child => ParseRelOp(child, ns))
            .ToList();

        return node;
    }

    private static double? ParseDouble(string? value)
    {
        if (double.TryParse(value, out var parsed))
            return parsed;
        return null;
    }
}
