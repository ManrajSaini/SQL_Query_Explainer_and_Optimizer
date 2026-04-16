namespace SqlExplainer.API.Models;

public class Suggestion
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? FixSnippet { get; set; }
    public string Severity { get; set; } = "warning"; // warning | critical | info
}
