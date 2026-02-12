"use client";

import { useState, useCallback, useRef } from "react";
import { toPng, toSvg } from "html-to-image";
import {
  Save,
  Download,
  Undo2,
  Redo2,
  FileImage,
  ChevronDown,
  Check,
  Loader2,
  Settings,
  Layers,
  FileText,
  PenLine,
  Spline,
  Minus,
  CornerDownRight,
  GitBranch,
  Target,
  XCircle,
  AlertTriangle,
  Activity, // New import for observability icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canvas-store";
import type { EdgeType } from "@/stores/canvas-store";
import { detectCircularDependencies, findSinglePointsOfFailure } from "@/lib/analysis/graph";
import { useToast } from "@/components/ui/use-toast";

interface ToolbarProps {
  onSave?: () => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
  setIsDocumentationModalOpen: (isOpen: boolean) => void;
}

export function Toolbar({ onSave, canvasRef, setIsDocumentationModalOpen }: ToolbarProps) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isEdgeTypeMenuOpen, setIsEdgeTypeMenuOpen] = useState(false);
  const { toast } = useToast();

  const {
    diagramTitle,
    setDiagramTitle,
    isSaving,
    undo,
    redo,
    canUndo,
    canRedo,
    edgeType,
    setEdgeType,
    nodes,
    edges,
    setHighlights,
    clearHighlights,
    highlightedNodes,
    highlightedEdges,
    isObservabilityMode,
    toggleObservabilityMode,
    setNodeMetrics,
  } = useCanvasStore();

  const edgeTypeOptions: {
    type: EdgeType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      type: "default",
      label: "Bezier",
      icon: <Spline className="w-4 h-4" />,
      description: "Smooth curved line",
    },
    {
      type: "straight",
      label: "Straight",
      icon: <Minus className="w-4 h-4" />,
      description: "Direct straight line",
    },
    {
      type: "step",
      label: "Step",
      icon: <CornerDownRight className="w-4 h-4" />,
      description: "Right-angle connectors",
    },
    {
      type: "smoothstep",
      label: "Smooth Step",
      icon: <GitBranch className="w-4 h-4" />,
      description: "Rounded right-angle",
    },
  ];

  const currentEdgeOption =
    edgeTypeOptions.find((o) => o.type === edgeType) || edgeTypeOptions[0];

  // Handle title edit
  const handleTitleClick = useCallback(() => {
    setTitleValue(diagramTitle);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  }, [diagramTitle]);

  const handleTitleSubmit = useCallback(() => {
    if (titleValue.trim()) {
      setDiagramTitle(titleValue.trim());
    }
    setIsEditingTitle(false);
  }, [titleValue, setDiagramTitle]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleTitleSubmit();
      } else if (e.key === "Escape") {
        setIsEditingTitle(false);
      }
    },
    [handleTitleSubmit],
  );

  // Observability Mode Toggle
  const handleToggleObservabilityMode = useCallback(() => {
    toggleObservabilityMode();
    if (!isObservabilityMode) {
      // Generate dummy metrics when turning on
      const newMetrics = new Map();
      nodes.forEach((node) => {
        newMetrics.set(node.id, {
          requestRate: Math.random() * 100, // 0-100 req/s
          errorRate: Math.random() * 10, // 0-10% error rate
          latency: Math.random() * 1000, // 0-1000ms latency
        });
      });
      setNodeMetrics(newMetrics);
      toast({
        title: "Observability Mode On",
        description: "Displaying simulated real-time metrics.",
      });
    } else {
      // Clear metrics when turning off
      setNodeMetrics(new Map());
      toast({
        title: "Observability Mode Off",
        description: "Metrics overlay removed.",
      });
    }
  }, [isObservabilityMode, toggleObservabilityMode, nodes, setNodeMetrics, toast]);

  // Circular Dependency Analysis
  const handleDetectCircularDependencies = useCallback(() => {
    const cycles = detectCircularDependencies(nodes, edges);

    if (cycles.length > 0) {
      const cycleNodeIds = new Set<string>();
      const cycleEdgeIds = new Set<string>();

      cycles.forEach((cycle) => {
        cycle.forEach((nodeId, index) => {
          cycleNodeIds.add(nodeId);
          if (index < cycle.length - 1) {
            const source = cycle[index];
            const target = cycle[index + 1];
            const edge = edges.find(
              (e) => e.source === source && e.target === target,
            );
            if (edge) {
              cycleEdgeIds.add(edge.id);
            }
          }
        });
      });

      setHighlights(Array.from(cycleNodeIds), Array.from(cycleEdgeIds));
      toast({
        title: "Circular Dependencies Detected!",
        description: `Found ${cycles.length} cycles. Highlighted on canvas.`,
        variant: "destructive",
      });
    } else {
      clearHighlights();
      toast({
        title: "No Circular Dependencies",
        description: "Your diagram is cycle-free.",
      });
    }
  }, [nodes, edges, setHighlights, clearHighlights, toast]);

  // Single Point of Failure Analysis
  const handleDetectSinglePointsOfFailure = useCallback(() => {
    const spofs = findSinglePointsOfFailure(nodes, edges);

    if (spofs.length > 0) {
      setHighlights(spofs, []); // Highlight only the SPOF nodes
      toast({
        title: "Single Points of Failure Detected!",
        description: `Found ${spofs.length} potential SPOFs. Highlighted on canvas.`,
        variant: "destructive",
      });
    } else {
      clearHighlights();
      toast({
        title: "No Single Points of Failure",
        description: "Your diagram seems resilient.",
      });
    }
  }, [nodes, edges, setHighlights, clearHighlights, toast]);

  const handleClearHighlights = useCallback(() => {
    clearHighlights();
    toast({
      title: "Highlights Cleared",
      description: "Analysis highlights have been removed.",
    });
  }, [clearHighlights, toast]);

  // Export functions
  const exportAsPng = useCallback(async () => {
    if (!canvasRef?.current) return;

    try {
      const reactFlowElement = canvasRef.current.querySelector(
        ".react-flow",
      ) as HTMLElement;
      if (!reactFlowElement) return;

      const dataUrl = await toPng(reactFlowElement, {
        backgroundColor: "#030711",
        quality: 1,
      });

      const link = document.createElement("a");
      link.download = `${diagramTitle.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
    setIsExportMenuOpen(false);
  }, [canvasRef, diagramTitle]);

  const exportAsSvg = useCallback(async () => {
    if (!canvasRef?.current) return;

    try {
      const reactFlowElement = canvasRef.current.querySelector(
        ".react-flow",
      ) as HTMLElement;
      if (!reactFlowElement) return;

      const dataUrl = await toSvg(reactFlowElement, {
        backgroundColor: "#030711",
      });

      const link = document.createElement("a");
      link.download = `${diagramTitle.replace(/\s+/g, "-").toLowerCase()}.svg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
    setIsExportMenuOpen(false);
  }, [canvasRef, diagramTitle]);

  const exportAsJson = useCallback(() => {
    const diagramData = {
      nodes: nodes.map(node => ({ ...node, data: { ...node.data } })),
      edges: edges.map(edge => ({ ...edge, data: { ...edge.data } })),
      title: diagramTitle,
      description: useCanvasStore.getState().diagramDescription,
    };
    const jsonString = JSON.stringify(diagramData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${diagramTitle.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    setIsExportMenuOpen(false);
  }, [nodes, edges, diagramTitle]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
      {/* Diagram Title */}
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-4 py-2 flex items-center gap-3 shadow-lg">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            className="bg-transparent border-b border-primary text-foreground font-medium text-sm focus:outline-none min-w-[150px]"
          />
        ) : (
          <button
            onClick={handleTitleClick}
            className="flex items-center gap-2 text-foreground font-medium text-sm hover:text-primary transition-colors"
          >
            <span>{diagramTitle}</span>
            <PenLine className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}

        {/* Save Status */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border pl-3">
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span>Saved</span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-2 py-1.5 flex items-center gap-1 shadow-lg">
        {/* Undo */}
        <button
          onClick={() => undo()}
          disabled={!canUndo()}
          className={cn(
            "p-2 rounded-md transition-colors",
            canUndo()
              ? "hover:bg-muted text-foreground"
              : "text-muted-foreground/50 cursor-not-allowed",
          )}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onClick={() => redo()}
          disabled={!canRedo()}
          className={cn(
            "p-2 rounded-md transition-colors",
            canRedo()
              ? "hover:bg-muted text-foreground"
              : "text-muted-foreground/50 cursor-not-allowed",
          )}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Circular Dependency Analysis */}
        <button
          onClick={handleDetectCircularDependencies}
          className="p-2 rounded-md hover:bg-muted text-foreground transition-colors"
          title="Detect Circular Dependencies"
        >
          <Target className="w-4 h-4" />
        </button>

        {/* Single Points of Failure Analysis */}
        <button
          onClick={handleDetectSinglePointsOfFailure}
          className="p-2 rounded-md hover:bg-muted text-foreground transition-colors"
          title="Detect Single Points of Failure"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>

        {highlightedNodes.size > 0 && (
          <button
            onClick={handleClearHighlights}
            className="p-2 rounded-md hover:bg-muted text-foreground transition-colors"
            title="Clear Highlights"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Observability Mode Toggle */}
        <button
          onClick={handleToggleObservabilityMode}
          className={cn(
            "p-2 rounded-md transition-colors",
            isObservabilityMode
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "hover:bg-muted text-foreground",
          )}
          title="Toggle Observability Mode"
        >
          <Activity className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Edge Type Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsEdgeTypeMenuOpen(!isEdgeTypeMenuOpen)}
            className="p-2 rounded-md hover:bg-muted text-foreground transition-colors flex items-center gap-1.5"
            title={`Edge Type: ${currentEdgeOption.label}`}
          >
            {currentEdgeOption.icon}
            <ChevronDown className="w-3 h-3" />
          </button>

          {isEdgeTypeMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsEdgeTypeMenuOpen(false)}
              />
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-card border border-border rounded-lg shadow-xl z-50 min-w-[180px] py-1">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Edge Line Style
                </div>
                {edgeTypeOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => {
                      setEdgeType(option.type);
                      setIsEdgeTypeMenuOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-3 transition-colors",
                      edgeType === option.type && "bg-primary/10 text-primary",
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-md border",
                        edgeType === option.type
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/50",
                      )}
                    >
                      {option.icon}
                    </span>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    {edgeType === option.type && (
                      <Check className="w-4 h-4 ml-auto text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Save */}
        <button
          onClick={onSave}
          className="p-2 rounded-md hover:bg-muted text-foreground transition-colors"
          title="Save (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>

        {/* Generate Docs Button */}
        <button
          onClick={() => setIsDocumentationModalOpen(true)}
          className="p-2 rounded-md hover:bg-muted text-foreground transition-colors"
          title="Generate Documentation"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="p-2 rounded-md hover:bg-muted text-foreground transition-colors flex items-center gap-1"
            title="Export"
          >
            <Download className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </button>

          {isExportMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsExportMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl z-50 min-w-[150px] py-1">
                <button
                  onClick={exportAsPng}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2 transition-colors"
                >
                  <FileImage className="w-4 h-4" />
                  Export as PNG
                </button>
                <button
                  onClick={exportAsSvg}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Export as SVG
                </button>
                <button
                  onClick={exportAsJson}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export as JSON
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
