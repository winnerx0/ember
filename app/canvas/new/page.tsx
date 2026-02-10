"use client";

import { ReactFlowProvider } from "reactflow";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FlowCanvas } from "@/components/canvas/flow-canvas";
import { NodePalette } from "@/components/layout/node-palette";
import { Toolbar } from "@/components/layout/toolbar";
import { useCanvasStore } from "@/stores/canvas-store";
import { useCreateDiagram } from "@/lib/hooks/use-diagrams";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

function NewCanvasEditor() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { nodes, edges, diagramTitle, diagramDescription, setIsSaving } =
    useCanvasStore();
  const createDiagram = useCreateDiagram();
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track initial changes
  useEffect(() => {
    if (nodes.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [nodes, edges]);

  // Auto-create/save logic
  useEffect(() => {
    // Only create if we have nodes and haven't started creating yet
    if (
      hasUnsavedChanges &&
      !createDiagram.isPending &&
      !createDiagram.isSuccess
    ) {
      const timeoutId = setTimeout(() => {
        setIsSaving(true);
        createDiagram.mutate(
          {
            title: diagramTitle,
            description: diagramDescription,
            data: { nodes, edges },
          },
          {
            onSuccess: (diagram) => {
              setIsSaving(false);
              toast({
                title: "Diagram created",
                description: "Redirecting to your new diagram...",
              });
              // Redirect to the persistent URL
              router.push(`/canvas/${diagram.id}`);
            },
            onError: () => {
              setIsSaving(false);
              toast({
                title: "Error creating diagram",
                description: "Please check your internet connection.",
                variant: "destructive",
              });
            },
          },
        );
      }, 3000); // 3 second delay for first create

      return () => clearTimeout(timeoutId);
    }
  }, [
    hasUnsavedChanges,
    nodes,
    edges,
    diagramTitle,
    diagramDescription,
    createDiagram,
    router,
    setIsSaving,
    toast,
  ]);

  return (
    <div className="relative w-full h-screen flex overflow-hidden bg-background">
      <Toolbar canvasRef={canvasRef} />

      <NodePalette />

      <div className="flex-1 relative" ref={canvasRef}>
        <FlowCanvas />
      </div>
      <Toaster />
    </div>
  );
}

export default function NewCanvasPage() {
  return (
    <ReactFlowProvider>
      <NewCanvasEditor />
    </ReactFlowProvider>
  );
}
