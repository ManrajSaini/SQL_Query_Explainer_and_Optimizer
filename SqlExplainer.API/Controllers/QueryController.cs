using Microsoft.AspNetCore.Mvc;
using SqlExplainer.API.Models;
using SqlExplainer.API.Services;

namespace SqlExplainer.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QueryController : ControllerBase
{
    private readonly SqlParserService _parser;
    private readonly RuleEngineService _ruleEngine;
    private readonly ExecutionPlanService _executionPlanService;
    private readonly ExplanationService _explanationService;

    public QueryController(
        SqlParserService parser,
        RuleEngineService ruleEngine,
        ExecutionPlanService executionPlanService,
        ExplanationService explanationService)
    {
        _parser = parser;
        _ruleEngine = ruleEngine;
        _executionPlanService = executionPlanService;
        _explanationService = explanationService;
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> Analyze([FromBody] QueryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Sql))
            return BadRequest("SQL cannot be empty.");

        var (fragment, errors) = _parser.Parse(request.Sql);

        if (fragment is null)
        {
            return Ok(new QueryAnalysisResult
            {
                IsValid = false,
                ParseErrors = errors
            });
        }

        var summary = _parser.BuildSummary(fragment);
        var suggestions = _ruleEngine.Run(summary, fragment);
        var explanation = await _explanationService.ExplainAsync(summary, suggestions);

        var result = new QueryAnalysisResult
        {
            IsValid = true,
            AstSummary = summary,
            Suggestions = suggestions,
            Explanation = explanation,
        };

        if (!string.IsNullOrWhiteSpace(request.ConnectionString))
        {
            try
            {
                var xmlPlan = await _executionPlanService.GetXmlPlanAsync(request.ConnectionString, request.Sql);
                result.ExecutionPlan = _executionPlanService.ParseXmlPlan(xmlPlan);
            }
            catch (Exception ex)
            {
                result.ExecutionPlanError = ex.Message;
            }
        }

        return Ok(result);
    }
}
