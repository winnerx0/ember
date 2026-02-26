import { useState, useEffect } from "react";
import { exportSQL } from "~/server/export";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

type Props = {
  projectId: string;
  projectName: string;
  onClose: () => void;
};

function highlightSQL(sql: string): string {
  if (!sql) return "";
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle>Export SQL</DialogTitle>
            <DialogDescription className="text-xs mt-0.5">
              PostgreSQL DDL for{" "}
              <span className="text-primary font-medium">{projectName}</span>
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 mr-6">
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
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 rounded-full animate-spin border-border border-t-primary" />
                Generating SQL...
              </div>
            </div>
          ) : (
            <pre
              className="sql-code whitespace-pre-wrap text-foreground"
              dangerouslySetInnerHTML={{ __html: highlightSQL(sql) }}
            />
          )}
        </div>

        {!loading && sql && (
          <div className="px-6 py-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
            <span>{sql.split("\n").length} lines</span>
            <span>{sql.length} characters</span>
            <span className="ml-auto text-green-500 font-medium">
              ✓ Valid PostgreSQL DDL
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
