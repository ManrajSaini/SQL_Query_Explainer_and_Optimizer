import type { Suggestion } from "../types";

interface Props {
  suggestions: Suggestion[];
  parseErrors: string[];
}

const severityConfig = {
  critical: {
    bg: "bg-red-900/40",
    border: "border-red-600",
    badge: "bg-red-600 text-white",
    label: "CRITICAL",
  },
  warning: {
    bg: "bg-yellow-900/30",
    border: "border-yellow-500",
    badge: "bg-yellow-500 text-black",
    label: "WARNING",
  },
  info: {
    bg: "bg-blue-900/30",
    border: "border-blue-500",
    badge: "bg-blue-500 text-white",
    label: "INFO",
  },
};

export default function SuggestionsPanel({ suggestions, parseErrors }: Props) {
  if (parseErrors.length > 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-red-400">Parse Errors</h2>
        {parseErrors.map((err, i) => (
          <div
            key={i}
            className="bg-red-900/30 border border-red-600 rounded-lg px-4 py-3 text-sm text-red-300 font-mono"
          >
            {err}
          </div>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        No suggestions — query looks good.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-200">
        Suggestions{" "}
        <span className="text-sm font-normal text-gray-500">
          ({suggestions.length})
        </span>
      </h2>
      {suggestions.map((s) => {
        const cfg = severityConfig[s.severity] ?? severityConfig.info;
        return (
          <div
            key={s.title}
            className={`rounded-lg border px-4 py-3 ${cfg.bg} ${cfg.border}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${cfg.badge}`}
              >
                {cfg.label}
              </span>
              <span className="text-sm font-semibold text-gray-200">
                {s.title}
              </span>
            </div>
            <p className="text-sm text-gray-400">{s.description}</p>
            {s.fixSnippet && (
              <div className="mt-2 flex items-start gap-2">
                <code className="text-xs bg-gray-900 text-green-300 px-3 py-1.5 rounded block flex-1 whitespace-pre-wrap">
                  {s.fixSnippet}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(s.fixSnippet!)}
                  className="text-xs text-gray-400 hover:text-white border border-gray-600 rounded px-2 py-1 shrink-0"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
