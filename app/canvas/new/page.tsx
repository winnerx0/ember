"use client";

import { ReactFlowProvider } from "reactflow";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FlowCanvas } from "@/components/canvas/flow-canvas";
import { NodePalette } from "@/components/layout/node-palette";
import { Toolbar } from "@/components/layout/toolbar";
import { CustomElementModal } from "@/components/modals/custom-element-modal";
import { useCanvasStore } from "@/stores/canvas-store";
import { useCreateDiagram } from "@/lib/hooks/use-diagrams";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import * as LucideIcons from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import type { NodeCategory } from "@/lib/types";

function NewCanvasEditor() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const {
    nodes,
    edges,
    diagramTitle,
    diagramDescription,
    setIsSaving,
    addCustomElement,
  } = useCanvasStore();
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

  const handleCreateCustomElement = (element: {
    name: string;
    category: NodeCategory;
    description: string;
    icon: string;
  }) => {
    addCustomElement(element);
    toast({
      title: "Custom Element Created",
      description: `${element.name} has been added to your library.`,
    });
  };

  console.log("NewCanvasEditor - isCustomModalOpen:", isCustomModalOpen);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative w-full h-screen flex overflow-hidden bg-background">
        <Toolbar canvasRef={canvasRef} />
        <NodePalette
          onAddCustomElement={() => {
            console.log("onAddCustomElement called in new page");
            setIsCustomModalOpen(true);
          }}
        />
        <SidebarInset className="flex-1 relative">
          <SidebarToggleButton />
          <div className="w-full h-full" ref={canvasRef}>
            <FlowCanvas />
          </div>
        </SidebarInset>
        <CustomElementModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onSave={handleCreateCustomElement}
        />
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

function SidebarToggleButton() {
  const { open, toggleSidebar } = useSidebar();

  if (open) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-4 left-4 z-50 h-8 w-8 rounded-md shadow-md hover:shadow-lg transition-all"
      onClick={toggleSidebar}
    >
      <LucideIcons.PanelLeft className="h-4 w-4" />
    </Button>
  );
}

export default function NewCanvasPage() {
  return (
    <ReactFlowProvider>
      <NewCanvasEditor />
    </ReactFlowProvider>
  );
}
