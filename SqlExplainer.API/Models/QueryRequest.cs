namespace SqlExplainer.API.Models;

public class QueryRequest
{
    public string Sql { get; set; } = string.Empty;
    public string? ConnectionString { get; set; }
}
