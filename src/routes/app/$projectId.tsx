"use client";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import { getProject } from "~/server/projects";
import {
  addTable,
  updateTable,
  deleteTable,
  saveNodePositions,
} from "~/server/tables";
import { saveColumns } from "~/server/columns";
import { addRelationship, deleteRelationship, updateRelationship } from "~/server/relationships";
import { TableNode, type TableNodeData } from "~/components/erd/TableNode";
import { RelationshipEdge } from "~/components/erd/RelationshipEdge";
import { ColumnEditor, type ColumnDraft } from "~/components/erd/ColumnEditor";
import { ExportModal } from "~/components/erd/ExportModal";
import { ThemeToggle } from "~/components/ThemeToggle";

export const Route = createFileRoute("/app/$projectId")({
  loader: ({ params }) => getProject({ data: { id: params.projectId } }),
  component: () => (
    <ReactFlowProvider>
      <ERDCanvas />
    </ReactFlowProvider>
  ),
});

const nodeTypes = { tableNode: TableNode };
const edgeTypes = { relationship: RelationshipEdge };

const TABLE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
];

function ERDCanvas() {
  const project = Route.useLoaderData();
  const { projectId } = Route.useParams();
  const { fitView } = useReactFlow();

  // Build initial nodes from project data
  const initialNodes: Node[] = project.tables.map((table: any) => ({
    id: table.id,
    type: "tableNode",
    position: { x: table.positionX, y: table.positionY },
    data: {
      id: table.id,
      name: table.name,
      color: table.color,
      projectId,
      columns: table.columns || [],
    } as TableNodeData,
  }));

  const initialEdges: Edge[] = project.relationships.map((rel: any) => ({
    id: rel.id,
    source: rel.sourceTableId,
    target: rel.targetTableId,
    sourceHandle: rel.sourceColumnId
      ? `${rel.sourceColumnId}-source`
      : `${rel.sourceTableId}-table-source`,
    targetHandle: rel.targetColumnId
      ? `${rel.targetColumnId}-target`
      : `${rel.targetTableId}-table-target`,
    type: "relationship",
    data: {
      type: rel.type,
      label: rel.label,
      projectId,
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [addingTable, setAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colorIdx = useRef(0);

  // Auto-fit on load
  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 100);
  }, []);

  // Debounced position save
  const scheduleSave = useCallback(
    (updatedNodes: Node[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        try {
          await saveNodePositions({
            data: {
              projectId,
              nodes: updatedNodes.map((n) => ({
                id: n.id,
                positionX: n.position.x,
                positionY: n.position.y,
              })),
            },
          });
        } finally {
          setSaving(false);
        }
      }, 1000);
    },
    [projectId],
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      const hasMoved = changes.some(
        (c: any) => c.type === "position" && c.dragging === false,
      );
      if (hasMoved) {
        setNodes((nds) => {
          scheduleSave(nds);
          return nds;
        });
      }
    },
    [onNodesChange, scheduleSave],
  );

  // Connect nodes
  const onConnect = useCallback(
    async (connection: Connection) => {
      const id = nanoid();
      const newEdge: Edge = {
        id,
        ...connection,
        type: "relationship",
        data: { type: "one-to-many", projectId },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Determine source/target column IDs from handle IDs
      const sourceColId = connection.sourceHandle?.replace("-source", "");
      const targetColId = connection.targetHandle?.replace("-target", "");

      await addRelationship({
        data: {
          projectId,
          sourceTableId: connection.source!,
          targetTableId: connection.target!,
          sourceColumnId: sourceColId?.includes("-table")
            ? undefined
            : sourceColId,
          targetColumnId: targetColId?.includes("-table")
            ? undefined
            : targetColId,
          type: "one-to-many",
        },
      });
    },
    [projectId, setEdges],
  );

  // Delete edge
  const handleDeleteEdge = useCallback(
    async (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      await deleteRelationship({ data: { id: edgeId, projectId } });
    },
    [projectId, setEdges],
  );

  // Update edge type
  const handleUpdateEdgeType = useCallback(
    async (edgeId: string, type: "one-to-one" | "one-to-many" | "many-to-many") => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId ? { ...e, data: { ...e.data, type } } : e
        )
      );
      await updateRelationship({ data: { id: edgeId, projectId, type } });
    },
    [projectId, setEdges],
  );

  // Update edges to include delete and type change handlers
  const edgesWithHandlers = edges.map((e) => ({
    ...e,
    data: {
      ...e.data,
      onDelete: handleDeleteEdge,
      onTypeChange: handleUpdateEdgeType
    },
  }));

  // Add table
  const handleAddTable = async () => {
    if (!newTableName.trim()) return;
    const id = nanoid();
    const color = TABLE_COLORS[colorIdx.current % TABLE_COLORS.length];
    colorIdx.current++;

    // Replace spaces with underscores in table name
    const sanitizedName = newTableName.trim().replace(/\s+/g, '_');

    const position = {
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200,
    };

    const newNode: Node = {
      id,
      type: "tableNode",
      position,
      data: {
        id,
        name: sanitizedName,
        color,
        projectId,
        columns: [],
        onSelect: setSelectedTableId,
        onDelete: handleDeleteTable,
      } as TableNodeData,
    };

    setNodes((nds) => [...nds, newNode]);
    setNewTableName("");
    setAddingTable(false);
    setSelectedTableId(id);

    await addTable({
      data: {
        projectId,
        name: sanitizedName,
        color,
        positionX: position.x,
        positionY: position.y,
      },
    });
  };

  // Delete table
  const handleDeleteTable = useCallback(
    async (tableId: string) => {
      if (!confirm("Delete this table and all its columns?")) return;
      setNodes((nds) => nds.filter((n) => n.id !== tableId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== tableId && e.target !== tableId),
      );
      if (selectedTableId === tableId) setSelectedTableId(null);
      await deleteTable({ data: { id: tableId, projectId } });
    },
    [projectId, selectedTableId, setNodes, setEdges],
  );

  // Update nodes with handlers
  const nodesWithHandlers = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      onSelect: setSelectedTableId,
      onDelete: handleDeleteTable,
    },
  }));

  // Get selected table data
  const selectedNode = nodes.find((n) => n.id === selectedTableId);
  const selectedTableData = selectedNode?.data as TableNodeData | undefined;

  // Save table edits
  const handleSaveTable = async (edits: {
    name: string;
    color: string;
    columns: ColumnDraft[];
  }) => {
    if (!selectedTableId) return;

    // Update node in state
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedTableId
          ? {
              ...n,
              data: {
                ...n.data,
                name: edits.name,
                color: edits.color,
                columns: edits.columns,
              },
            }
          : n,
      ),
    );

    // Persist
    await updateTable({
      data: {
        id: selectedTableId,
        projectId,
        name: edits.name,
        color: edits.color,
      },
    });

    await saveColumns({
      data: {
        tableId: selectedTableId,
        projectId,
        columns: edits.columns.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          nullable: c.nullable,
          isPrimary: c.isPrimary,
          isUnique: c.isUnique,
          defaultValue: c.defaultValue || undefined,
          order: c.order,
        })),
      },
    });

    // Close the sidebar after saving
    setSelectedTableId(null);
  };

  // Auto-layout (simple grid)
  const handleAutoLayout = () => {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const GAP_X = 320;
    const GAP_Y = 280;
    setNodes((nds) =>
      nds.map((n, i) => ({
        ...n,
        position: {
          x: (i % cols) * GAP_X + 60,
          y: Math.floor(i / cols) * GAP_Y + 60,
        },
      })),
    );
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  };

  return (
    <div className="flex h-screen" style={{ background: "var(--background)" }}>
      {/* Left sidebar */}
      <div
        className="w-56 flex-shrink-0 flex flex-col border-r"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Logo */}
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <Link
            to="/app"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <span className="font-black text-[10px]">E</span>
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Projects</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Project name */}
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
            Project
          </p>
          <p className="text-sm font-bold truncate" style={{ color: "var(--card-foreground)" }}>
            {project.name}
          </p>
          {project.description && (
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>
              {project.description}
            </p>
          )}
        </div>

        {/* Tables list */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Tables ({nodes.length})
            </p>
          </div>
          <div className="space-y-1">
            {nodes.map((n) => {
              const d = n.data as TableNodeData;
              return (
                <button
                  key={n.id}
                  onClick={() => setSelectedTableId(n.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all border"
                  style={{
                    background:
                      selectedTableId === n.id
                        ? "var(--accent)"
                        : "transparent",
                    borderColor:
                      selectedTableId === n.id
                        ? "var(--border)"
                        : "transparent",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-xs truncate" style={{ color: "var(--foreground)" }}>
                    {d.name}
                  </span>
                  <span className="text-[10px] ml-auto" style={{ color: "var(--muted-foreground)" }}>
                    {d.columns?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Add table inline */}
          {addingTable ? (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTable();
                  if (e.key === "Escape") setAddingTable(false);
                }}
                placeholder="table_name"
                className="w-full px-2.5 py-2 rounded-lg text-xs border focus:outline-none"
                style={{
                  background: "var(--input)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)"
                }}
                autoFocus
              />
              <div className="flex gap-1.5">
                <button
                  onClick={handleAddTable}
                  disabled={!newTableName.trim()}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-foreground)"
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingTable(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs border transition-all"
                  style={{
                    color: "var(--muted-foreground)",
                    borderColor: "var(--border)"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingTable(true)}
              className="w-full mt-2 flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs border border-dashed transition-all"
              style={{
                color: "var(--muted-foreground)",
                borderColor: "var(--border)"
              }}
            >
              <span>+</span>
              <span>Add Table</span>
            </button>
          )}
        </div>

        {/* Bottom actions */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={handleAutoLayout}
            className="w-full py-2 rounded-lg text-xs font-medium border transition-all"
            style={{
              color: "var(--foreground)",
              borderColor: "var(--border)"
            }}
          >
            ⊞ Auto Layout
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="w-full py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            ↓ Export SQL
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {/* Top bar */}
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 border-b"
          style={{
            background: "var(--card)",
            backdropFilter: "blur(8px)",
            borderColor: "var(--border)"
          }}
        >
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <span>{nodes.length} tables</span>
            <span>·</span>
            <span>{edges.length} relationships</span>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-xs flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                <div className="w-3 h-3 border rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
                Saving...
              </span>
            )}
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Drag handles to connect tables
            </span>
          </div>
        </div>

        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edgesWithHandlers}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: "relationship",
            animated: false,
          }}
          style={{ paddingTop: 44 }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            style={{ backgroundColor: "var(--background)" }}
          />
          <Controls position="bottom-right" style={{ bottom: 16, right: 16 }} />
          <MiniMap
            position="bottom-left"
            style={{ bottom: 16, left: 16 }}
            nodeColor={(n) => (n.data as TableNodeData).color || "var(--primary)"}
            maskColor="rgba(0,0,0,0.6)"
          />
        </ReactFlow>

        {/* Empty state overlay */}
        {nodes.length === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ paddingTop: 44 }}
          >
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border"
                style={{
                  background: "var(--accent)",
                  borderColor: "var(--border)"
                }}
              >
                ⬡
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--foreground)" }}>Empty Canvas</h3>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Add your first table using the sidebar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Column editor panel */}
      {selectedTableId && selectedTableData && (
        <ColumnEditor
          table={{
            id: selectedTableId,
            name: selectedTableData.name,
            color: selectedTableData.color,
            columns: (selectedTableData.columns || []) as ColumnDraft[],
          }}
          onSave={handleSaveTable}
          onClose={() => setSelectedTableId(null)}
        />
      )}

      {/* Export modal */}
      {showExport && (
        <ExportModal
          projectId={projectId}
          projectName={project.name}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
