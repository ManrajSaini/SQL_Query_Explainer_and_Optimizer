using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using SqlExplainer.API.Models;

namespace SqlExplainer.API.Services;

public class ExplanationService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _configuration;

    public ExplanationService(HttpClient http, IConfiguration configuration)
    {
        _http = http;
        _configuration = configuration;
    }

    public async Task<string> ExplainAsync(AstSummary summary, List<Suggestion> suggestions)
    {
        var apiKey = _configuration["Groq:ApiKey"]
                     ?? Environment.GetEnvironmentVariable("GROQ_API_KEY");
        var model = _configuration["Groq:Model"]
                ?? Environment.GetEnvironmentVariable("GROQ_MODEL")
                ?? "llama-3.1-8b-instant";

        if (string.IsNullOrWhiteSpace(apiKey))
            return BuildFallbackExplanation(summary, suggestions);

        var prompt = $$"""
            Explain this SQL query analysis to a developer in 3-4 sentences.
            Be specific, practical, and avoid jargon.

            Query structure:
            - Type: {{summary.StatementType}}
            - Tables: {{string.Join(", ", summary.TablesReferenced)}}
            - Joins: {{string.Join(", ", summary.Joins.Select(j => j.JoinType))}}
            - Has WHERE: {{summary.HasWhereClause}}
            - Has GROUP BY: {{summary.HasGroupBy}}
            - Subqueries: {{summary.HasSubqueries}}

            Issues found:
            {{string.Join("\n", suggestions.Select(s => $"- [{s.Severity}] {s.Title}: {s.Description}"))}}
            """;

        var payload = new
        {
            model,
            max_tokens = 300,
            temperature = 0.2,
            messages = new[]
            {
                new { role = "system", content = "You are a practical SQL performance mentor." },
                new { role = "user", content = prompt }
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return BuildFallbackExplanation(summary, suggestions);

        var data = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (data.TryGetProperty("choices", out var choices)
            && choices.ValueKind == JsonValueKind.Array
            && choices.GetArrayLength() > 0
            && choices[0].TryGetProperty("message", out var message)
            && message.TryGetProperty("content", out var contentNode))
        {
            return contentNode.GetString() ?? BuildFallbackExplanation(summary, suggestions);
        }

        return BuildFallbackExplanation(summary, suggestions);
    }

    private static string BuildFallbackExplanation(AstSummary summary, List<Suggestion> suggestions)
    {
        var tableSummary = summary.TablesReferenced.Count == 0
            ? "no table references"
            : string.Join(", ", summary.TablesReferenced);

        var joinSummary = summary.Joins.Count == 0
            ? "no joins"
            : string.Join(", ", summary.Joins.Select(j => j.JoinType));

        var issueSummary = suggestions.Count == 0
            ? "No major issues were found by static analysis."
            : $"{suggestions.Count} issue(s) were detected, including {suggestions[0].Title}.";

        return $"This is a {summary.StatementType} query over {tableSummary} with {joinSummary}. " +
               $"WHERE clause present: {summary.HasWhereClause}, GROUP BY present: {summary.HasGroupBy}, ORDER BY present: {summary.HasOrderBy}. " +
               issueSummary +
               " Use the suggestions below to reduce scans, improve join efficiency, and simplify execution.";
    }
}
