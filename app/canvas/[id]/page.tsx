"use client";

import { ReactFlowProvider } from "reactflow";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FlowCanvas } from "@/components/canvas/flow-canvas";
import { NodePalette } from "@/components/layout/node-palette";
import { Toolbar } from "@/components/layout/toolbar";
import { CustomElementModal } from "@/components/modals/custom-element-modal";
import { useCanvasStore } from "@/stores/canvas-store";
import { useDiagram, useUpdateDiagram } from "@/lib/hooks/use-diagrams";
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

function CanvasEditor() {
  const params = useParams();
  const diagramId = params.id as string;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: diagram, isLoading } = useDiagram(diagramId);
  const updateDiagram = useUpdateDiagram();

  const {
    loadDiagram,
    nodes,
    edges,
    diagramTitle,
    diagramDescription,
    isSaving,
    setIsSaving,
    addCustomElement,
  } = useCanvasStore();

  // Load diagram data
  useEffect(() => {
    if (diagram) {
      const localDataStr = localStorage.getItem(`diagram-${diagramId}`);
      let nodesToLoad = diagram.data.nodes;
      let edgesToLoad = diagram.data.edges;
      let titleToLoad = diagram.title;
      let descriptionToLoad = diagram.description;

      if (localDataStr) {
        try {
          const localData = JSON.parse(localDataStr);
          const serverTime = new Date(diagram.updated_at).getTime();
          const localTime = localData.lastModified || 0;

          if (localTime > serverTime) {
            nodesToLoad = localData.nodes;
            edgesToLoad = localData.edges;
            titleToLoad = localData.title;
            descriptionToLoad = localData.description;

            toast({
              title: "Loaded local changes",
              description: "Latest changes were restored from your browser.",
            });
          }
        } catch (e) {
          console.error("Error parsing local data", e);
        }
      }

      loadDiagram({
        id: diagram.id,
        title: titleToLoad,
        description: descriptionToLoad || "",
        nodes: nodesToLoad,
        edges: edgesToLoad,
      });
    }
  }, [diagram, loadDiagram, diagramId, toast]);

  // Auto-save logic
  // Local Storage Save (Debounced)
  useEffect(() => {
    if (!diagram || isLoading) return;

    const timeoutId = setTimeout(() => {
      const saveData = {
        nodes,
        edges,
        title: diagramTitle,
        description: diagramDescription,
        lastModified: Date.now(),
      };
      localStorage.setItem(`diagram-${diagramId}`, JSON.stringify(saveData));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    nodes,
    edges,
    diagramTitle,
    diagramDescription,
    diagramId,
    diagram,
    isLoading,
  ]);

  // Database Sync (Periodic - 5 minutes)
  useEffect(() => {
    if (!diagram || isLoading) return;

    const syncInterval = setInterval(
      () => {
        const hasChanged =
          JSON.stringify(nodes) !== JSON.stringify(diagram.data.nodes) ||
          JSON.stringify(edges) !== JSON.stringify(diagram.data.edges) ||
          diagramTitle !== diagram.title;

        if (hasChanged) {
          setIsSaving(true);
          updateDiagram.mutate(
            {
              id: diagramId,
              diagram: {
                title: diagramTitle,
                description: diagramDescription,
                data: { nodes, edges },
              },
            },
            {
              onSuccess: () => {
                setIsSaving(false);
                queryClient.invalidateQueries({
                  queryKey: ["diagram", diagramId],
                });
              },
              onError: () => {
                setIsSaving(false);
                toast({
                  title: "Error syncing diagram",
                  description:
                    "Could not sync changes to server. Saved locally.",
                  variant: "destructive",
                });
              },
            },
          );
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(syncInterval);
  }, [
    nodes,
    edges,
    diagramTitle,
    diagramDescription,
    diagram,
    updateDiagram,
    diagramId,
    setIsSaving,
    queryClient,
    toast,
    isLoading,
  ]);

  // Manual save handler
  const handleSave = useCallback(() => {
    setIsSaving(true);
    updateDiagram.mutate(
      {
        id: diagramId,
        diagram: {
          title: diagramTitle,
          description: diagramDescription,
          data: { nodes, edges },
        },
      },
      {
        onSuccess: () => {
          setIsSaving(false);
          toast({
            title: "Diagram saved",
            description: "Your changes have been saved successfully.",
          });
        },
        onError: () => {
          setIsSaving(false);
          toast({
            title: "Error saving diagram",
            description: "Could not save changes.",
            variant: "destructive",
          });
        },
      },
    );
  }, [
    diagramId,
    diagramTitle,
    diagramDescription,
    nodes,
    edges,
    updateDiagram,
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

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading diagram...</div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative w-full h-screen flex overflow-hidden bg-background">
        <Toolbar onSave={handleSave} canvasRef={canvasRef} />

        <NodePalette onAddCustomElement={() => setIsCustomModalOpen(true)} />

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

export default function CanvasPage() {
  return (
    <ReactFlowProvider>
      <CanvasEditor />
    </ReactFlowProvider>
  );
}
