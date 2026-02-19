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
import {
  addRelationship,
  deleteRelationship,
  updateRelationship,
} from "~/server/relationships";
import { TableNode, type TableNodeData } from "~/components/erd/TableNode";
import { RelationshipEdge } from "~/components/erd/RelationshipEdge";
import { ColumnEditor, type ColumnDraft } from "~/components/erd/ColumnEditor";
import { ExportModal } from "~/components/erd/ExportModal";
import { ThemeToggle } from "~/components/ThemeToggle";
import { ConfirmModal } from "~/components/ui/confirm-modal";
import { supabase } from "~/lib/supabase";

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
  const project: { name: string; description: string; tables: any[]; relationships: any[] } = Route.useLoaderData();
  const { projectId } = Route.useParams();
  const { fitView } = useReactFlow();

  // LocalStorage key for this project
  const lsKey = `ember-${projectId}`;

  // Build initial nodes from project data or localStorage
  const savedNodes = typeof window !== "undefined"
    ? localStorage.getItem(`${lsKey}-nodes`)
    : null;

  const initialNodes: Node[] = savedNodes
    ? JSON.parse(savedNodes)
    : project.tables.map((table: any) => ({
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
    sourceHandle: `${rel.sourceTableId}-table-source`,
    targetHandle: `${rel.targetTableId}-table-target`,
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
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    tableId: string | null;
    tableName: string;
  }>({ isOpen: false, tableId: null, tableName: "" });
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colorIdx = useRef(0);

  // Get user on mount and clear auth hash
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Clear OAuth hash from URL after session is established
      if (window.location.hash.includes("access_token")) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    getUser();
  }, []);

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
  // Source = OWNER/PARENT (the "one" side, the table you drag FROM)
  // Target = CHILD (the "many" side, holds the FK, the table you drag TO)
  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const id = nanoid();

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      const sourceTableData = sourceNode.data as TableNodeData;
      const targetTableData = targetNode.data as TableNodeData;

      // FK column lives in the TARGET (child) table, referencing the SOURCE (parent/owner).
      // Naming convention: sourceTableName_id
      const fkColumnName = `${sourceTableData.name}_id`;

      // Check if FK column already exists in the target (child) table
      const fkExists = targetTableData.columns?.some(
        (col) => col.name === fkColumnName,
      );

      let updatedTargetColumns = targetTableData.columns || [];

      if (!fkExists) {
        // Match the type of the source table's primary key
        const sourcePK = sourceTableData.columns?.find((col) => col.isPrimary);
        const fkType = sourcePK?.type || "uuid";

        const newFkColumn = {
          id: nanoid(),
          name: fkColumnName,
          type: fkType,
          isPrimary: false,
          isUnique: false,
          nullable: false,
          defaultValue: null,
          order: updatedTargetColumns.length,
        };

        updatedTargetColumns = [...updatedTargetColumns, newFkColumn];

        console.log(
          "Adding FK:",
          fkColumnName,
          "to child table",
          targetTableData.name,
        );

        // Update the TARGET (child) node with the new FK column
        setNodes((nds) =>
          nds.map((n) =>
            n.id === connection.target
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    columns: [...updatedTargetColumns],
                  },
                }
              : n,
          ),
        );

        // Persist to database
        try {
          await saveColumns({
            data: {
              tableId: connection.target,
              projectId,
              columns: updatedTargetColumns.map((c, i) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                nullable: c.nullable,
                isPrimary: c.isPrimary,
                isUnique: c.isUnique,
                defaultValue: c.defaultValue || undefined,
                order: i,
              })),
            },
          });
        } catch (error) {
          console.error("Failed to save FK column:", error);
        }
      }

      // Add the edge
      const newEdge: Edge = {
        id,
        ...connection,
        type: "relationship",
        data: { type: "one-to-many", projectId },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      await addRelationship({
        data: {
          sourceTableId: connection.source,
          targetTableId: connection.target,
          type: "one-to-many",
        },
      });
    },
    [projectId, setEdges, nodes, setNodes],
  );

  // Delete edge — also removes the FK column from the TARGET (child) table
  const handleDeleteEdge = useCallback(
    async (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);

      if (edge) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (sourceNode && targetNode) {
          const sourceTableData = sourceNode.data as TableNodeData;
          const targetTableData = targetNode.data as TableNodeData;

          // FK column is in the TARGET (child) table, named after the SOURCE (parent)
          const fkColumnName = `${sourceTableData.name}_id`;

          const updatedColumns = (targetTableData.columns || []).filter(
            (col) => col.name !== fkColumnName,
          );

          // Update TARGET node without the FK column
          setNodes((nds) =>
            nds.map((n) =>
              n.id === edge.target
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      columns: [...updatedColumns],
                    },
                  }
                : n,
            ),
          );

          try {
            await saveColumns({
              data: {
                tableId: edge.target,
                projectId,
                columns: updatedColumns.map((c, i) => ({
                  id: c.id,
                  name: c.name,
                  type: c.type,
                  nullable: c.nullable,
                  isPrimary: c.isPrimary,
                  isUnique: c.isUnique,
                  defaultValue: c.defaultValue || undefined,
                  order: i,
                })),
              },
            });
          } catch (error) {
            console.error("Failed to remove FK column:", error);
          }
        }
      }

      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      await deleteRelationship({ data: { id: edgeId, projectId } });
    },
    [projectId, setEdges, edges, nodes, setNodes],
  );

  // Sign out
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  }, []);

  // Update edge type — also moves FK column to the correct table
  const handleUpdateEdgeType = useCallback(
    async (
      edgeId: string,
      newType: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many",
    ) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      const oldType = (edge.data as any)?.type || "one-to-many";

      // Determine which table currently has the FK column and which should have it
      // "many" side holds the FK. For one-to-one, FK stays on target.
      const oldFKSide = oldType === "many-to-one" ? "source" : "target";
      const newFKSide =
        newType === "many-to-one"
          ? "source"
          : newType === "many-to-many"
            ? "none"
            : "target"; // one-to-one and one-to-many both put FK on target

      // Update the edge type
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId ? { ...e, data: { ...e.data, type: newType } } : e,
        ),
      );

      // Move the FK column if needed
      if (oldFKSide !== newFKSide && edge.source && edge.target) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (sourceNode && targetNode) {
          const sourceData = sourceNode.data as TableNodeData;
          const targetData = targetNode.data as TableNodeData;

          // FK column name depends on which table is the "one" (parent/owner) side
          // The FK references the parent's PK
          const oldParentData =
            oldFKSide === "target" ? sourceData : targetData;
          const oldFKName = `${oldParentData.name}_id`;

          // Remove FK from the old table
          const oldFKTable = oldFKSide === "target" ? edge.target : edge.source;
          const oldFKTableData =
            oldFKSide === "target" ? targetData : sourceData;
          const columnsWithoutFK = (oldFKTableData.columns || []).filter(
            (col) => col.name !== oldFKName,
          );

          // If we need to add FK to a new table (not "none" for many-to-many)
          if (newFKSide !== "none") {
            const newFKTable =
              newFKSide === "target" ? edge.target : edge.source;
            const newParentData =
              newFKSide === "target" ? sourceData : targetData;
            const newFKTableData =
              newFKSide === "target" ? targetData : sourceData;
            const newFKName = `${newParentData.name}_id`;

            // Check if FK already exists in the new table
            const newTableColumns =
              newFKTable === oldFKTable
                ? columnsWithoutFK
                : newFKTableData.columns || [];
            const fkAlreadyExists = newTableColumns.some(
              (col) => col.name === newFKName,
            );

            let updatedNewColumns = [...newTableColumns];
            if (!fkAlreadyExists) {
              const parentPK = newParentData.columns?.find(
                (col) => col.isPrimary,
              );
              updatedNewColumns.push({
                id: nanoid(),
                name: newFKName,
                type: parentPK?.type || "uuid",
                isPrimary: false,
                isUnique: false,
                nullable: false,
                defaultValue: null,
                order: updatedNewColumns.length,
              });
            }

            // Update nodes
            setNodes((nds) =>
              nds.map((n) => {
                if (n.id === oldFKTable && oldFKTable !== newFKTable) {
                  // Remove FK from old table
                  return {
                    ...n,
                    data: { ...n.data, columns: [...columnsWithoutFK] },
                  };
                }
                if (n.id === newFKTable) {
                  // Add FK to new table (or update if same table)
                  return {
                    ...n,
                    data: { ...n.data, columns: [...updatedNewColumns] },
                  };
                }
                return n;
              }),
            );

            // Persist changes
            try {
              if (oldFKTable !== newFKTable) {
                await saveColumns({
                  data: {
                    tableId: oldFKTable,
                    projectId,
                    columns: columnsWithoutFK.map((c, i) => ({
                      id: c.id,
                      name: c.name,
                      type: c.type,
                      nullable: c.nullable,
                      isPrimary: c.isPrimary,
                      isUnique: c.isUnique,
                      defaultValue: c.defaultValue || undefined,
                      order: i,
                    })),
                  },
                });
              }
              await saveColumns({
                data: {
                  tableId: newFKTable,
                  projectId,
                  columns: updatedNewColumns.map((c, i) => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    nullable: c.nullable,
                    isPrimary: c.isPrimary,
                    isUnique: c.isUnique,
                    defaultValue: c.defaultValue || undefined,
                    order: i,
                  })),
                },
              });
            } catch (error) {
              console.error("Failed to move FK column:", error);
            }
          } else {
            // many-to-many: just remove the FK from the old table
            setNodes((nds) =>
              nds.map((n) =>
                n.id === oldFKTable
                  ? {
                      ...n,
                      data: { ...n.data, columns: [...columnsWithoutFK] },
                    }
                  : n,
              ),
            );
            try {
              await saveColumns({
                data: {
                  tableId: oldFKTable,
                  projectId,
                  columns: columnsWithoutFK.map((c, i) => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    nullable: c.nullable,
                    isPrimary: c.isPrimary,
                    isUnique: c.isUnique,
                    defaultValue: c.defaultValue || undefined,
                    order: i,
                  })),
                },
              });
            } catch (error) {
              console.error("Failed to remove FK column:", error);
            }
          }
        }
      }

      await updateRelationship({
        data: { id: edgeId, projectId, type: newType },
      });
    },
    [projectId, setEdges, edges, nodes, setNodes],
  );

  // Update edges to include delete and type change handlers
  const edgesWithHandlers = edges.map((e) => ({
    ...e,
    data: {
      ...e.data,
      onDelete: handleDeleteEdge,
      onTypeChange: handleUpdateEdgeType,
    },
  }));

  // Add table
  const handleAddTable = async () => {
    if (!newTableName.trim()) return;
    const id = nanoid();
    const color = TABLE_COLORS[colorIdx.current % TABLE_COLORS.length];
    colorIdx.current++;

    const sanitizedName = newTableName.trim().replace(/\s+/g, "_");

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
      const table = nodes.find((n) => n.id === tableId);
      if (!table) return;

      const tableName = (table.data as TableNodeData).name;
      setDeleteConfirm({ isOpen: true, tableId, tableName });
    },
    [nodes],
  );

  const confirmDeleteTable = useCallback(async () => {
    const { tableId } = deleteConfirm;
    if (!tableId) return;

    setNodes((nds) => nds.filter((n) => n.id !== tableId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== tableId && e.target !== tableId),
    );
    if (selectedTableId === tableId) setSelectedTableId(null);
    await deleteTable({ data: { id: tableId, projectId } });

    setDeleteConfirm({ isOpen: false, tableId: null, tableName: "" });
  }, [projectId, selectedTableId, setNodes, setEdges, deleteConfirm]);

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

    // Get current table data before update to detect PK type changes
    const currentNode = nodes.find((n) => n.id === selectedTableId);
    const currentData = currentNode?.data as TableNodeData | undefined;
    const currentTableName = currentData?.name || "";
    const newPK = edits.columns.find((c) => c.isPrimary);
    const oldPK = currentData?.columns?.find((c) => c.isPrimary);
    const pkTypeChanged = newPK && oldPK && newPK.type !== oldPK.type;

    // FK column name that other tables use to reference this table
    const fkName = `${currentTableName}_id`;

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedTableId) {
          return {
            ...n,
            data: {
              ...n.data,
              name: edits.name,
              color: edits.color,
              columns: edits.columns,
            },
          };
        }
        // If PK type changed, update FK columns in other tables that reference this table
        if (pkTypeChanged && newPK) {
          const tableData = n.data as TableNodeData;
          const hasFKRef = tableData.columns?.some(
            (col) => col.name === fkName,
          );
          if (hasFKRef) {
            return {
              ...n,
              data: {
                ...n.data,
                columns: tableData.columns.map((col) =>
                  col.name === fkName ? { ...col, type: newPK.type } : col,
                ),
              },
            };
          }
        }
        return n;
      }),
    );

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

    // If PK type changed, persist FK type updates in related tables
    if (pkTypeChanged && newPK) {
      const affectedNodes = nodes.filter((n) => {
        if (n.id === selectedTableId) return false;
        const td = n.data as TableNodeData;
        return td.columns?.some((col) => col.name === fkName);
      });

      for (const affNode of affectedNodes) {
        const td = affNode.data as TableNodeData;
        const updatedCols = td.columns.map((col) =>
          col.name === fkName ? { ...col, type: newPK.type } : col,
        );
        try {
          await saveColumns({
            data: {
              tableId: affNode.id,
              projectId,
              columns: updatedCols.map((c, i) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                nullable: c.nullable,
                isPrimary: c.isPrimary,
                isUnique: c.isUnique,
                defaultValue: c.defaultValue || undefined,
                order: i,
              })),
            },
          });
        } catch (error) {
          console.error(`Failed to update FK type in table ${td.name}:`, error);
        }
      }
    }

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
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <Link
            to="/app"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <span className="font-black text-[10px]">E</span>
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              Projects
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Project name */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-[10px] uppercase tracking-wider mb-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Project
          </p>
          <p
            className="text-sm font-bold truncate"
            style={{ color: "var(--card-foreground)" }}
          >
            {project.name}
          </p>
          {project.description && (
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: "var(--muted-foreground)" }}
            >
              {project.description}
            </p>
          )}
        </div>

        {/* Tables list */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)" }}
            >
              Tables ({nodes.length})
            </p>
          </div>
          <div className="space-y-1">
            {nodes.map((n) => {
              const d = n.data as TableNodeData;
              return (
                <div
                  key={n.id}
                  className="group flex items-center gap-2 rounded-lg transition-all border"
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
                  <button
                    onClick={() => setSelectedTableId(n.id)}
                    className="flex-1 flex items-center gap-2 px-2.5 py-2 text-left"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <span
                      className="text-xs truncate flex-1"
                      style={{ color: "var(--foreground)" }}
                    >
                      {d.name}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {d.columns?.length || 0}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTable(n.id);
                    }}
                    className="px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                    title="Delete table"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
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
                  color: "var(--foreground)",
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
                    color: "var(--primary-foreground)",
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingTable(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs border transition-all"
                  style={{
                    color: "var(--muted-foreground)",
                    borderColor: "var(--border)",
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
                borderColor: "var(--border)",
              }}
            >
              <span>+</span>
              <span>Add Table</span>
            </button>
          )}
        </div>

        {/* Bottom actions */}
        <div
          className="p-3 border-t space-y-2"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={handleAutoLayout}
            className="w-full py-2 rounded-lg text-xs font-medium border transition-all"
            style={{
              color: "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            ⊞ Auto Layout
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="w-full py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
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
            borderColor: "var(--border)",
          }}
        >
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            <span>{nodes.length} tables</span>
            <span>·</span>
            <span>{edges.length} relationships</span>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span
                className="text-xs flex items-center gap-1.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                <div
                  className="w-3 h-3 border rounded-full animate-spin"
                  style={{
                    borderColor: "var(--border)",
                    borderTopColor: "var(--primary)",
                  }}
                />
                Saving...
              </span>
            )}
            <span
              className="text-xs hidden sm:inline"
              style={{ color: "var(--muted-foreground)" }}
            >
              Drag from owner → child to connect
            </span>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-lg transition-all hover:opacity-80"
                style={{ background: "var(--accent)" }}
              >
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    {user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    className="absolute right-0 top-full mt-1 z-50 rounded-lg border shadow-lg overflow-hidden min-w-[160px]"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {user && (
                      <div className="px-3 py-2 border-b text-xs" style={{ borderColor: "var(--border)" }}>
                        <p className="font-medium truncate max-w-[200px]">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="truncate max-w-[200px]" style={{ color: "var(--muted-foreground)" }}>
                          {user.email}
                        </p>
                      </div>
                    )}
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-xs hover:opacity-80 transition-opacity"
                      style={{ color: "var(--foreground)" }}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>⚙</span>
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:opacity-80 transition-opacity text-left"
                      style={{ color: "var(--destructive)" }}
                    >
                      <span>→</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
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
            nodeColor={(n) =>
              (n.data as TableNodeData).color || "var(--primary)"
            }
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
                  borderColor: "var(--border)",
                }}
              >
                ⬡
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Empty Canvas
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
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

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, tableId: null, tableName: "" })
        }
        onConfirm={confirmDeleteTable}
        title="Delete Table"
        description={`Are you sure you want to delete the table "${deleteConfirm.tableName}"? This will also delete all its columns and relationships. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
