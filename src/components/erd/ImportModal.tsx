import { useState, useRef, useCallback } from "react";
import { importYAML, parseYAMLSchema } from "~/server/import";
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
  onImported: () => void;
};

const EXAMPLE_YAML = `tables:
  users:
    columns:
      id:
        type: uuid
        primary: true
        default: gen_random_uuid()
      email:
        type: text
        unique: true
      name:
        type: text
      created_at:
        type: timestamptz
        default: now()

  posts:
    columns:
      id:
        type: uuid
        primary: true
        default: gen_random_uuid()
      title:
        type: text
        nullable: false
      body:
        type: text
      published:
        type: boolean
        default: "false"

  tags:
    columns:
      id:
        type: serial
        primary: true
      name:
        type: varchar
        unique: true

relationships:
  - from: users
    to: posts
    type: one-to-many

  - from: posts
    to: tags
    type: many-to-many`;

function highlightYAML(yaml: string): string {
  if (!yaml) return "";
  return yaml
    .replace(/(#[^\n]*)/g, '<span class="yaml-comment">$1</span>')
    .replace(
      /^(\s*)([\w-]+)(:)/gm,
      '$1<span class="yaml-key">$2</span><span class="yaml-colon">$3</span>',
    )
    .replace(
      /:\s+(true|false)\s*$/gm,
      ': <span class="yaml-bool">$1</span>',
    )
    .replace(
      /:\s+(\d+(?:\.\d+)?)\s*$/gm,
      ': <span class="yaml-number">$1</span>',
    )
    .replace(
      /:\s+"([^"]*)"/gm,
      ': <span class="yaml-string">"$1"</span>',
    )
    .replace(
      /:\s+(one-to-one|one-to-many|many-to-one|many-to-many)/g,
      ': <span class="yaml-type">$1</span>',
    )
    .replace(
      /:\s+(uuid|serial|bigserial|integer|int|bigint|smallint|numeric|decimal|real|double precision|boolean|text|varchar|char|date|timestamp|timestamptz|json|jsonb|bytea)\s*$/gm,
      ': <span class="yaml-type">$1</span>',
    )
    .replace(
      /^(\s*- )/gm,
      '<span class="yaml-dash">$1</span>',
    );
}

export function ImportModal({
  projectId,
  projectName,
  onClose,
  onImported,
}: Props) {
  const [yaml, setYaml] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    tableCount: number;
    relationshipCount: number;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((text: string) => {
    if (!text.trim()) {
      setErrors([]);
      return;
    }
    const { errors: validationErrors } = parseYAMLSchema(text);
    setErrors(validationErrors);
  }, []);

  const handleChange = (text: string) => {
    setYaml(text);
    setResult(null);
    validate(text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setYaml(text);
      setResult(null);
      validate(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!yaml.trim() || errors.length > 0) return;

    setImporting(true);
    try {
      const res = await importYAML({
        data: { projectId, yaml },
      });
      setResult(res);
      onImported();
    } catch (err: any) {
      setErrors(err.message.split("\n"));
    } finally {
      setImporting(false);
    }
  };

  const loadExample = () => {
    setYaml(EXAMPLE_YAML);
    setResult(null);
    validate(EXAMPLE_YAML);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle>Import from YAML</DialogTitle>
            <DialogDescription className="text-xs mt-0.5">
              Define your schema in YAML for{" "}
              <span className="text-primary font-medium">{projectName}</span>
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 mr-6">
            <Button
              onClick={loadExample}
              variant="outline"
              size="sm"
              disabled={importing}
            >
              Load Example
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              disabled={importing}
            >
              Upload .yaml
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".yaml,.yml"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={handleImport}
              size="sm"
              disabled={!yaml.trim() || errors.length > 0 || importing || !!result}
            >
              {importing
                ? "Importing..."
                : result
                  ? "Imported!"
                  : "Import"}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
          {result ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="text-4xl">&#10003;</div>
              <div className="text-lg font-semibold text-foreground">
                Import Successful
              </div>
              <div className="text-sm text-muted-foreground">
                Created {result.tableCount} table{result.tableCount !== 1 ? "s" : ""} and{" "}
                {result.relationshipCount} relationship{result.relationshipCount !== 1 ? "s" : ""}
              </div>
              <Button onClick={onClose} size="sm" className="mt-2">
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="relative flex-1 min-h-[300px]">
                <textarea
                  ref={textareaRef}
                  value={yaml}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder={`# Paste your YAML schema here...\n\ntables:\n  users:\n    columns:\n      id:\n        type: uuid\n        primary: true`}
                  className="w-full h-full min-h-[300px] p-4 font-mono text-sm bg-muted/50 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/50"
                  spellCheck={false}
                  disabled={importing}
                />
              </div>

              {errors.length > 0 && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 space-y-1">
                  {errors.map((err, i) => (
                    <div key={i} className="text-xs text-destructive flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">&#10005;</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {yaml.trim() && errors.length === 0 && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">
                    Preview
                  </div>
                  <pre
                    className="yaml-code whitespace-pre-wrap text-sm text-foreground"
                    dangerouslySetInnerHTML={{
                      __html: highlightYAML(yaml),
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {!result && (
          <div className="px-6 py-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
            <span>{yaml.split("\n").length} lines</span>
            <span>{yaml.length} characters</span>
            {yaml.trim() && errors.length === 0 && (
              <span className="ml-auto text-green-500 font-medium">
                &#10003; Valid YAML schema
              </span>
            )}
            {errors.length > 0 && (
              <span className="ml-auto text-destructive font-medium">
                {errors.length} error{errors.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
