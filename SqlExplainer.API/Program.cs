using SqlExplainer.API.Services;

var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

builder.Services.AddSingleton<SqlParserService>();
builder.Services.AddSingleton<RuleEngineService>();
builder.Services.AddScoped<ExecutionPlanService>();
builder.Services.AddHttpClient<ExplanationService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
