"use client";

import { useCanvasStore } from "@/stores/canvas-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NodePropertiesForm } from "@/components/forms/node-properties-form";
import { EdgePropertiesForm } from "@/components/forms/edge-properties-form";

export function PropertiesPanel() {
  const { selectedNodeId, selectedEdgeId, isPropertiesPanelOpen, togglePropertiesPanel } = useCanvasStore();

  const isOpen = isPropertiesPanelOpen && (selectedNodeId !== null || selectedEdgeId !== null);

  return (
    <Sheet open={isOpen} onOpenChange={togglePropertiesPanel}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Properties</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {selectedNodeId && <NodePropertiesForm />}
          {selectedEdgeId && <EdgePropertiesForm />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
