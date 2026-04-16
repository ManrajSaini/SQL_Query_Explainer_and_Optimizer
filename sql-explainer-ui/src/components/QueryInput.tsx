import Editor from "@monaco-editor/react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  connectionString: string;
  onConnectionStringChange: (value: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export default function QueryInput({
  value,
  onChange,
  connectionString,
  onConnectionStringChange,
  onAnalyze,
  loading,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg overflow-hidden border border-gray-700 bg-gray-900/50 p-3">
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          SQL Server connection string (optional)
        </label>
        <input
          value={connectionString}
          onChange={(e) => onConnectionStringChange(e.target.value)}
          placeholder="Server=...;Database=...;User Id=...;Password=...;TrustServerCertificate=True;"
          className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500">
          Used only for this request to fetch an XML execution plan. It is not
          saved.
        </p>
      </div>

      <Editor
        height="220px"
        language="sql"
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val ?? "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          renderLineHighlight: "line",
          tabSize: 2,
          quickSuggestions: false,
          acceptSuggestionOnCommitCharacter: false,
          parameterHints: { enabled: false },
          codeLens: false,
        }}
      />
      <button
        onClick={onAnalyze}
        disabled={loading || !value.trim()}
        className="self-end rounded bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Query"}
      </button>
    </div>
  );
}
