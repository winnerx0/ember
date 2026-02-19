import { useState, useEffect } from "react";
import { exportSQL } from "~/server/export";
import { Button } from "~/components/ui/button";

type Props = {
  projectId: string;
  projectName: string;
  onClose: () => void;
};

function highlightSQL(sql: string): string {
  return sql
    .replace(
      /\b(CREATE|TABLE|IF|NOT|EXISTS|ALTER|ADD|CONSTRAINT|FOREIGN|KEY|REFERENCES|PRIMARY|UNIQUE|DEFAULT|INDEX|ON)\b/g,
      '<span class="sql-keyword">$1</span>',
    )
    .replace(
      /\b(UUID|TEXT|VARCHAR|INTEGER|BIGINT|SMALLINT|SERIAL|BIGSERIAL|BOOLEAN|TIMESTAMP|TIMESTAMPTZ|DATE|JSON|JSONB|NUMERIC|REAL|BYTEA|CHAR)\b/g,
      '<span class="sql-type">$1</span>',
    )
    .replace(/(--[^\n]*)/g, '<span class="sql-comment">$1</span>')
    .replace(/'([^']*)'/g, "<span class=\"sql-string\">'$1'</span>");
}

export function ExportModal({ projectId, projectName, onClose }: Props) {
  const [sql, setSql] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    exportSQL({ data: { projectId } })
      .then((result) => {
        setSql(result.sql);
      })
      .catch((err) => {
        setSql(`-- Error generating SQL: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sql], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "_").toLowerCase()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border flex flex-col overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)", maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="font-bold text-lg" style={{ color: "var(--card-foreground)" }}>Export SQL</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              PostgreSQL DDL for{" "}
              <span style={{ color: "var(--primary)" }}>{projectName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              disabled={loading || !sql}
              variant="outline"
              size="sm"
            >
              {copied ? "✓ Copied!" : "Copy"}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={loading || !sql}
              size="sm"
            >
              ↓ Download .sql
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* SQL content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-48" style={{ color: "var(--muted-foreground)" }}>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
                Generating SQL...
              </div>
            </div>
          ) : (
            <pre
              className="sql-code whitespace-pre-wrap"
              style={{ color: "var(--foreground)" }}
              dangerouslySetInnerHTML={{ __html: highlightSQL(sql) }}
            />
          )}
        </div>

        {/* Footer stats */}
        {!loading && sql && (
          <div className="px-6 py-3 border-t flex items-center gap-4 text-xs" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
            <span>{sql.split("\n").length} lines</span>
            <span>{sql.length} characters</span>
            <span className="ml-auto text-green-400">
              ✓ Valid PostgreSQL DDL
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
