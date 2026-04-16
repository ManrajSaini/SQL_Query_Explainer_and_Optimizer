import { useState } from "react";
import QueryInput from "./components/QueryInput";
import SuggestionsPanel from "./components/SuggestionsPanel";
import AstTreeView from "./components/AstTreeView";
import ExecutionPlanView from "./components/ExecutionPlanView";
import { analyzeQuery } from "./services/api";
import type { QueryAnalysisResult } from "./types";

const SAMPLE_QUERY = `SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.name
ORDER BY order_count DESC`;

export default function App() {
  const [sql, setSql] = useState(SAMPLE_QUERY);
  const [connectionString, setConnectionString] = useState("");
  const [result, setResult] = useState<QueryAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeQuery(
        sql,
        connectionString.trim() || undefined,
      );
      setResult(data);
    } catch {
      setError(
        "Could not reach the API. Make sure the backend is running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">SQL Query Explainer</h1>
          <p className="text-sm text-gray-500 mt-1">
            Paste a SQL query to get optimization suggestions and an AST
            breakdown.
          </p>
        </div>
        <QueryInput
          value={sql}
          onChange={setSql}
          connectionString={connectionString}
          onConnectionStringChange={setConnectionString}
          onAnalyze={handleAnalyze}
          loading={loading}
        />
        {error && (
          <div className="bg-red-900/30 border border-red-600 rounded-lg px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {result && (
          <div className="space-y-6">
            {result.explanation && (
              <div className="rounded border border-blue-700 bg-blue-900/20 px-4 py-3">
                <h2 className="text-lg font-semibold text-blue-200">
                  AI Explanation
                </h2>
                <p className="mt-2 text-sm text-blue-100">
                  {result.explanation}
                </p>
              </div>
            )}

            <SuggestionsPanel
              suggestions={result.suggestions}
              parseErrors={result.parseErrors}
            />

            {result.astSummary && (
              <AstTreeView
                summary={result.astSummary}
                suggestions={result.suggestions}
              />
            )}

            <ExecutionPlanView
              plan={result.executionPlan}
              error={result.executionPlanError}
            />
          </div>
        )}
      </div>
    </div>
  );
}
