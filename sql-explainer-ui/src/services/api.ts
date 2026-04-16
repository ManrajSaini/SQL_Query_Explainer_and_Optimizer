import axios from "axios";
import type { QueryAnalysisResult } from "../types";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

export async function analyzeQuery(
  sql: string,
  connectionString?: string,
): Promise<QueryAnalysisResult> {
  const response = await axios.post<QueryAnalysisResult>(
    `${BASE}/query/analyze`,
    {
      sql,
      connectionString,
    },
  );
  return response.data;
}
