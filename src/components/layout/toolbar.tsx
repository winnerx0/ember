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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canvas-store";
import type { EdgeType } from "@/stores/canvas-store";

interface ToolbarProps {
  onSave?: () => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

export function Toolbar({ onSave, canvasRef }: ToolbarProps) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [isEdgeTypeMenuOpen, setIsEdgeTypeMenuOpen] = useState(false);

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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
