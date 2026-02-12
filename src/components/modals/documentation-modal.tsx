"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCanvasStore } from "@/stores/canvas-store";
import { detectCircularDependencies, findSinglePointsOfFailure } from "@/lib/analysis/graph";
import type { Node, Edge } from "reactflow";
import type { NodeData, EdgeData } from "@/lib/types";
import { Copy, CheckIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentationModal({
  isOpen,
  onClose,
}: DocumentationModalProps) {
  const { nodes, edges, diagramTitle, diagramDescription } = useCanvasStore();
  const [markdown, setMarkdown] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateDocumentation = useCallback(() => {
    let doc = `# ${diagramTitle || "Untitled Diagram"}

`;
    if (diagramDescription) {
      doc += `${diagramDescription}

`;
    }

    doc += `## Services (${nodes.length})

`;
    nodes.forEach((node: Node<NodeData>) => {
      doc += `### ${node.data.label} (${node.data.category})
`;
      if (node.data.description) {
        doc += `- Description: ${node.data.description}
`;
      }
      if (node.data.techStack) {
        doc += `- Tech Stack: ${node.data.techStack}
`;
      }
      if (node.data.databaseType) {
        doc += `- Database Type: ${node.data.databaseType}
`;
      }
      if (node.data.deploymentType) {
        doc += `- Deployment Type: ${node.data.deploymentType}
`;
      }
      if (node.data.scalingStrategy) {
        doc += `- Scaling Strategy: ${node.data.scalingStrategy}
`;
      }
      if (node.data.healthStatus) {
        doc += `- Health Status: ${node.data.healthStatus}
`;
      }
      doc += `
`;
    });

    doc += `## Connections (${edges.length})

`;
    edges.forEach((edge: Edge<EdgeData>) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (sourceNode && targetNode) {
        doc += `### ${sourceNode.data.label} -> ${targetNode.data.label}
`;
        if (edge.data?.label) {
          doc += `- Label: ${edge.data.label}
`;
        }
        if (edge.data?.communicationType) {
          doc += `- Communication: ${edge.data.communicationType}`;
          if (edge.data.isAsync) {
            doc += " (Async)";
          }
          doc += "";
        }
        if (edge.data?.authenticationType) {
          doc += `- Authentication: ${edge.data.authenticationType}
`;
        }
        if (edge.data?.latency) {
          doc += `- Latency: ${edge.data.latency}ms
`;
        }
        if (edge.data?.retryStrategy) {
          doc += `- Retry Strategy: ${edge.data.retryStrategy}
`;
        }
        doc += `
`;
      }
    });

    const circularDependencies = detectCircularDependencies(nodes, edges);
    if (circularDependencies.length > 0) {
      doc += `## Detected Circular Dependencies

`;
      circularDependencies.forEach((cycle, index) => {
        doc += `${index + 1}. ${cycle.map((nodeId) => nodes.find((n) => n.id === nodeId)?.data.label || nodeId).join(" -> ")}
`;
      });
      doc += `
`;
    }

    const spofs = findSinglePointsOfFailure(nodes, edges);
    if (spofs.length > 0) {
      doc += `## Potential Single Points of Failure

`;
      spofs.forEach((nodeId) => {
        doc += `- ${nodes.find((n) => n.id === nodeId)?.data.label || nodeId}
`;
      });
      doc += `
`;
    }

    setMarkdown(doc);
  }, [nodes, edges, diagramTitle, diagramDescription]);

  // Generate on open
  useEffect(() => {
    if (isOpen) {
      generateDocumentation();
      setCopied(false);
    }
  }, [isOpen, generateDocumentation]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast({
      title: "Copied to Clipboard",
      description: "Documentation markdown has been copied.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Documentation Summary</DialogTitle>
          <DialogDescription>
            Automatically generated markdown summary of your diagram.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex flex-col">
          <ScrollArea className="flex-1 border rounded-md p-4 font-mono text-sm bg-muted/20">
            <pre className="whitespace-pre-wrap">{markdown}</pre>
          </ScrollArea>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCopy} disabled={!markdown}>
              {copied ? (
                <CheckIcon className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Markdown"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}