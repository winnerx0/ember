"use client";
import Link from "next/link";
import Image from "next/image";
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
import { useCallback, useState, useRef, useEffect, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProject } from "~/server/projects";
import {
  addTable,
  updateTable,
  deleteTable,
  saveNodePositions,
} from "~/server/tables";
import { saveColumns, saveColumnsBatch } from "~/server/columns";
import {
  addRelationship,
  deleteRelationship,
  updateRelationship,
} from "~/server/relationships";
import { TableNode, type TableNodeData } from "~/components/erd/TableNode";
import { RelationshipEdge } from "~/components/erd/RelationshipEdge";
import { ColumnEditor, type ColumnDraft } from "~/components/erd/ColumnEditor";
import { ExportModal } from "~/components/erd/ExportModal";
import { ImportModal } from "~/components/erd/ImportModal";
import { ThemeToggle } from "~/components/ThemeToggle";
import { ConfirmModal } from "~/components/ui/confirm-modal";
import { supabase } from "~/lib/supabase";
import { toast } from "sonner";
import { clearSessionCookies } from "~/server/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { UserMenu } from "~/components/UserMenu";
import clsx from "clsx";

const nodeTypes = { tableNode: TableNode };
const edgeTypes = { relationship: RelationshipEdge };

const TABLE_COLORS = [
  "oklch(0.488 0.243 264.376)", // Blue/Purple - dark mode chart-1
  "oklch(0.696 0.17 162.48)", // Teal - dark mode chart-2
  "oklch(0.769 0.188 70.08)", // Green - dark mode chart-3
  "oklch(0.627 0.265 303.9)", // Purple - dark mode chart-4
  "oklch(0.645 0.246 16.439)", // Orange - dark mode chart-5
];

function ERDCanvas({ params }: { params: { projectId: string } }) {
  const projectId = params.projectId;

  const { data: project, isLoading: loading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject({ data: { id: projectId } }),
    staleTime: 5 * 60 * 1000,
  });

  const reactFlowInstance = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [addingTable, setAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    tableId: string | null;
    tableName: string;
  }>({ isOpen: false, tableId: null, tableName: "" });
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const colorIdx = useRef(0);
  const initialLoadDone = useRef(false);
  const pendingChanges = useRef<Set<string>>(new Set());

  // Undo/redo history (snapshots of nodes + edges)
  const history = useRef<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const historyIndex = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Stable refs so subscriptions don't re-subscribe on every state change
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);

  // LocalStorage keys
  const STORAGE_KEY = `erd-project-${projectId}`;
  const LAST_SYNC_KEY = `erd-project-${projectId}-last-sync`;

  // Save to localStorage whenever nodes or edges change
  useEffect(() => {
    if (initialLoadDone.current && (nodes.length > 0 || edges.length > 0)) {
      const data = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          type: e.type,
          data: e.data,
        })),
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [nodes, edges, projectId, STORAGE_KEY]);

  // Keep refs in sync (used in subscriptions to avoid stale closures)
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  // Sync to database every 5 minutes
  const syncToDatabase = useCallback(async () => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    if (!initialLoadDone.current || currentNodes.length === 0) return;

    setSaving(true);
    try {
      // Run all three syncs in parallel: positions, table metadata, columns
      await Promise.all([
        // 1 request: batch update all positions
        saveNodePositions({
          data: {
            projectId,
            nodes: currentNodes.map((n) => ({
              id: n.id,
              positionX: n.position.x,
              positionY: n.position.y,
            })),
          },
        }),

        // 1 request per table for name/color (batched via Promise.all)
        Promise.all(
          currentNodes.map((node) => {
            const tableData = node.data as TableNodeData;
            return updateTable({
              data: { id: node.id, projectId, name: tableData.name, color: tableData.color },
            });
          }),
        ),

        // 3 requests total for ALL columns across all tables (GET + DELETE + UPSERT)
        saveColumnsBatch({
          data: currentNodes
            .filter((n) => {
              const d = n.data as TableNodeData;
              return d.columns && d.columns.length > 0;
            })
            .map((n) => {
              const d = n.data as TableNodeData;
              return {
                tableId: n.id,
                columns: d.columns.map((c, i) => ({
                  id: c.id,
                  name: c.name,
                  type: c.type,
                  nullable: c.nullable,
                  isPrimary: c.isPrimary,
                  isUnique: c.isUnique,
                  defaultValue: c.defaultValue || undefined,
                  order: i,
                })),
              };
            }),
        }),

        // 1 request per relationship (batched via Promise.all)
        Promise.all(
          currentEdges.map((edge) => {
            const edgeData = edge.data as any;
            return updateRelationship({
              data: { id: edge.id, projectId, type: edgeData.type },
            });
          }),
        ),
      ]);

      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      console.log("Synced to database at", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Failed to sync to database:", error);
    } finally {
      setSaving(false);
    }
  }, [projectId, LAST_SYNC_KEY]);

  // Push a snapshot to undo history after every significant operation
  const pushToHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    // Truncate any "redo" states
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push({
      nodes: newNodes.map((n) => ({ ...n, data: { ...n.data } })),
      edges: newEdges.map((e) => ({ ...e, data: { ...e.data } })),
    });
    if (history.current.length > 50) history.current.shift();
    historyIndex.current = history.current.length - 1;
    setCanUndo(historyIndex.current > 0);
    setCanRedo(false);
  }, []);

  // Sync an arbitrary state snapshot to the database (used after undo/redo)
  const syncHistoryState = useCallback(
    async (prevNodes: Node[], prevEdges: Edge[], nextNodes: Node[], nextEdges: Edge[]) => {
      const prevNodeIds = new Set(prevNodes.map((n) => n.id));
      const nextNodeIds = new Set(nextNodes.map((n) => n.id));
      const prevEdgeIds = new Set(prevEdges.map((e) => e.id));
      const nextEdgeIds = new Set(nextEdges.map((e) => e.id));

      // Delete removed tables (cascades to columns + relationships)
      for (const id of [...prevNodeIds].filter((id) => !nextNodeIds.has(id))) {
        try { await deleteTable({ data: { id, projectId } }); } catch { /* ignore */ }
      }
      // Delete removed relationships
      for (const id of [...prevEdgeIds].filter((id) => !nextEdgeIds.has(id))) {
        try { await deleteRelationship({ data: { id, projectId } }); } catch { /* ignore */ }
      }
      // Re-add tables that were restored by undo
      for (const node of nextNodes.filter((n) => !prevNodeIds.has(n.id))) {
        const d = node.data as TableNodeData;
        try {
          await addTable({ data: { id: node.id, projectId, name: d.name, color: d.color, positionX: node.position.x, positionY: node.position.y } });
          if (d.columns?.length) {
            await saveColumns({ data: { tableId: node.id, projectId, columns: d.columns.map((c, i) => ({ ...c, defaultValue: c.defaultValue || undefined, order: i })) } });
          }
        } catch { /* may already exist, updateTable below will handle it */ }
      }
      // Re-add relationships that were restored by undo
      for (const edge of nextEdges.filter((e) => !prevEdgeIds.has(e.id))) {
        const edgeData = edge.data as any;
        const srcNode = nextNodes.find((n) => n.id === edge.source);
        const tgtNode = nextNodes.find((n) => n.id === edge.target);
        if (srcNode && tgtNode) {
          const srcData = srcNode.data as TableNodeData;
          const tgtData = tgtNode.data as TableNodeData;
          const srcPK = srcData.columns?.find((c) => c.isPrimary);
          const tgtFK = tgtData.columns?.find((c) => c.name === `${srcData.name}_id`);
          if (srcPK && tgtFK) {
            try {
              await addRelationship({ data: { id: edge.id, sourceTableId: edge.source, targetTableId: edge.target, sourceColumnId: srcPK.id, targetColumnId: tgtFK.id, type: edgeData.type || "one-to-many" } });
            } catch { /* ignore */ }
          }
        }
      }
      // Upsert positions and columns for all surviving nodes
      if (nextNodes.length > 0) {
        await saveNodePositions({ data: { projectId, nodes: nextNodes.map((n) => ({ id: n.id, positionX: n.position.x, positionY: n.position.y })) } });
        for (const node of nextNodes) {
          const d = node.data as TableNodeData;
          try { await updateTable({ data: { id: node.id, projectId, name: d.name, color: d.color } }); } catch { /* ignore */ }
          if (d.columns?.length) {
            try { await saveColumns({ data: { tableId: node.id, projectId, columns: d.columns.map((c, i) => ({ ...c, defaultValue: c.defaultValue || undefined, order: i })) } }); } catch { /* ignore */ }
          }
        }
      }
    },
    [projectId],
  );

  const undo = useCallback(async () => {
    if (historyIndex.current <= 0) return;
    const prevState = history.current[historyIndex.current];
    historyIndex.current--;
    const nextState = history.current[historyIndex.current];
    setNodes(nextState.nodes);
    setEdges(nextState.edges);
    setCanUndo(historyIndex.current > 0);
    setCanRedo(true);
    setSaving(true);
    try { await syncHistoryState(prevState.nodes, prevState.edges, nextState.nodes, nextState.edges); }
    catch (e) { console.error("Undo sync failed:", e); }
    finally { setSaving(false); }
  }, [setNodes, setEdges, syncHistoryState]);

  const redo = useCallback(async () => {
    if (historyIndex.current >= history.current.length - 1) return;
    const prevState = history.current[historyIndex.current];
    historyIndex.current++;
    const nextState = history.current[historyIndex.current];
    setNodes(nextState.nodes);
    setEdges(nextState.edges);
    setCanUndo(true);
    setCanRedo(historyIndex.current < history.current.length - 1);
    setSaving(true);
    try { await syncHistoryState(prevState.nodes, prevState.edges, nextState.nodes, nextState.edges); }
    catch (e) { console.error("Redo sync failed:", e); }
    finally { setSaving(false); }
  }, [setNodes, setEdges, syncHistoryState]);

  // Load from localStorage or database on mount
  useEffect(() => {
    if (project && !initialLoadDone.current) {
      initialLoadDone.current = true;

      // Try to load from localStorage first
      const stored = localStorage.getItem(STORAGE_KEY);
      const lastSync = localStorage.getItem(LAST_SYNC_KEY);

      if (stored) {
        try {
          const data = JSON.parse(stored);
          const storedTime = data.timestamp || 0;
          const lastSyncTime = lastSync ? parseInt(lastSync) : 0;

          // Use localStorage data if it's newer than last sync
          if (storedTime > lastSyncTime) {
            console.log("Loading from localStorage (unsaved changes detected)");
            const lsNodes = data.nodes || [];
            const lsEdges = data.edges || [];
            setNodes(lsNodes);
            setEdges(lsEdges);
            // Push initial state to history
            history.current = [{ nodes: lsNodes, edges: lsEdges }];
            historyIndex.current = 0;
            setCanUndo(false);
            setCanRedo(false);
            // Sync immediately if there are unsaved changes
            setTimeout(() => syncToDatabase(), 1000);
            return;
          }
        } catch (error) {
          console.error("Failed to parse localStorage data:", error);
        }
      }

      // Load from database
      console.log("Loading from database");
      const dbNodes: Node[] = project.tables.map((table: any) => ({
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

      const dbEdges: Edge[] = project.relationships.map((rel: any) => ({
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
          sourceColumnId: rel.sourceColumnId,
          targetColumnId: rel.targetColumnId,
        },
      }));

      setNodes(dbNodes);
      setEdges(dbEdges);
      // Push initial state to history
      history.current = [{ nodes: dbNodes, edges: dbEdges }];
      historyIndex.current = 0;
      setCanUndo(false);
      setCanRedo(false);

      // Save to localStorage after loading from DB
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          nodes: dbNodes,
          edges: dbEdges,
          timestamp: Date.now(),
        }),
      );
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    }
  }, [
    project,
    projectId,
    setNodes,
    setEdges,
    STORAGE_KEY,
    LAST_SYNC_KEY,
    syncToDatabase,
  ]);

  // Setup periodic sync every 5 minutes
  useEffect(() => {
    if (!initialLoadDone.current) return;

    // Sync every 5 minutes (300000ms)
    syncTimer.current = setInterval(() => {
      syncToDatabase();
    }, 300000);

    // Sync on page unload
    const handleBeforeUnload = () => {
      syncToDatabase();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (syncTimer.current) {
        clearInterval(syncTimer.current);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [syncToDatabase]);

  // Get user on mount and clear auth hash
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    setTimeout(
      () => reactFlowInstance.fitView({ padding: 0.2, duration: 500 }),
      100,
    );
  }, []);

  // Realtime subscription for relationships
  useEffect(() => {
    const channel = supabase
      .channel(`erd_relationships:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "erd_relationships",
        },
        (payload) => {
          const newRel = payload.new as any;

          // Only handle if it belongs to this project's tables
          const nodeIds = new Set(nodesRef.current.map((n) => n.id));
          if (!nodeIds.has(newRel.source_table_id) && !nodeIds.has(newRel.target_table_id)) return;

          // Check if this edge already exists
          const edgeExists = edgesRef.current.some((e) => e.id === newRel.id);
          if (edgeExists) return;

          const newEdge: Edge = {
            id: newRel.id,
            source: newRel.source_table_id,
            target: newRel.target_table_id,
            sourceHandle: `${newRel.source_table_id}-table-source`,
            targetHandle: `${newRel.target_table_id}-table-target`,
            type: "relationship",
            data: {
              type: newRel.type as
                | "one-to-one"
                | "one-to-many"
                | "many-to-one"
                | "many-to-many",
              label: newRel.label,
              projectId,
            },
          };

          setEdges((eds) => [...eds, newEdge]);

          // Note: FK columns will be synced via the columns realtime subscription
          // toast.info("Relationship added by collaborator");
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "erd_relationships",
        },
        (payload) => {
          const updatedRel = payload.new as any;

          setEdges((eds) =>
            eds.map((e) =>
              e.id === updatedRel.id
                ? {
                    ...e,
                    data: {
                      ...e.data,
                      type: updatedRel.type as
                        | "one-to-one"
                        | "one-to-many"
                        | "many-to-one"
                        | "many-to-many",
                      label: updatedRel.label,
                    },
                  }
                : e,
            ),
          );
          // toast.info("Relationship updated by collaborator");
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "erd_relationships",
        },
        (payload) => {
          const deletedRel = payload.old as any;

          setEdges((eds) => eds.filter((e) => e.id !== deletedRel.id));
          // toast.info("Relationship removed by collaborator");
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, setEdges]);

  // Realtime subscription for tables
  useEffect(() => {
    const channel = supabase
      .channel(`erd_tables:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "erd_tables",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const newTable = payload.new as any;

          // Check if this node already exists
          const nodeExists = nodesRef.current.some((n) => n.id === newTable.id);
          if (nodeExists) return;

          const newNode: Node = {
            id: newTable.id,
            type: "tableNode",
            position: { x: newTable.position_x, y: newTable.position_y },
            data: {
              id: newTable.id,
              name: newTable.name,
              color: newTable.color,
              projectId,
              columns: [],
            } as TableNodeData,
          };

          setNodes((nds) => [...nds, newNode]);
          // toast.info(`Table "${newTable.name}" added by collaborator`);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "erd_tables",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const updatedTable = payload.new as any;

          setNodes((nds) =>
            nds.map((n) =>
              n.id === updatedTable.id
                ? {
                    ...n,
                    position: {
                      x: updatedTable.position_x,
                      y: updatedTable.position_y,
                    },
                    data: {
                      ...n.data,
                      name: updatedTable.name,
                      color: updatedTable.color,
                    },
                  }
                : n,
            ),
          );
          // toast.info(`Table "${updatedTable.name}" updated by collaborator`);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "erd_tables",
        },
        (payload) => {
          const deletedTable = payload.old as any;

          setNodes((nds) => nds.filter((n) => n.id !== deletedTable.id));
          // toast.info(`Table removed by collaborator`);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, setNodes]);

  // Realtime subscription for columns
  useEffect(() => {
    const channel = supabase
      .channel(`erd_columns:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "erd_columns",
        },
        (payload) => {
          const newColumn = payload.new as any;

          // Update the node with the new column
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === newColumn.table_id) {
                const tableData = n.data as TableNodeData;
                // Check if column already exists
                const columnExists = tableData.columns?.some(
                  (c) => c.id === newColumn.id,
                );
                if (columnExists) return n;

                const updatedColumns = [
                  ...(tableData.columns || []),
                  {
                    id: newColumn.id,
                    name: newColumn.name,
                    type: newColumn.type,
                    nullable: newColumn.nullable,
                    isPrimary: newColumn.is_primary,
                    isUnique: newColumn.is_unique,
                    defaultValue: newColumn.default_value,
                    order: newColumn.order,
                  },
                ].sort((a, b) => a.order - b.order);

                return {
                  ...n,
                  data: {
                    ...n.data,
                    columns: updatedColumns,
                  },
                };
              }
              return n;
            }),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "erd_columns",
        },
        (payload) => {
          const updatedColumn = payload.new as any;

          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === updatedColumn.table_id) {
                const tableData = n.data as TableNodeData;
                const updatedColumns = (tableData.columns || [])
                  .map((c) =>
                    c.id === updatedColumn.id
                      ? {
                          id: updatedColumn.id,
                          name: updatedColumn.name,
                          type: updatedColumn.type,
                          nullable: updatedColumn.nullable,
                          isPrimary: updatedColumn.is_primary,
                          isUnique: updatedColumn.is_unique,
                          defaultValue: updatedColumn.default_value,
                          order: updatedColumn.order,
                        }
                      : c,
                  )
                  .sort((a, b) => a.order - b.order);

                return {
                  ...n,
                  data: {
                    ...n.data,
                    columns: updatedColumns,
                  },
                };
              }
              return n;
            }),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "erd_columns",
        },
        (payload) => {
          const deletedColumn = payload.old as any;

          setNodes((nds) =>
            nds.map((n) => {
              const tableData = n.data as TableNodeData;
              const hasColumn = tableData.columns?.some(
                (c) => c.id === deletedColumn.id,
              );

              if (hasColumn) {
                const updatedColumns = (tableData.columns || []).filter(
                  (c) => c.id !== deletedColumn.id,
                );

                return {
                  ...n,
                  data: {
                    ...n.data,
                    columns: updatedColumns,
                  },
                };
              }
              return n;
            }),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, setNodes]);

  // Debounced position save - now just updates localStorage
  const scheduleSave = useCallback((updatedNodes: Node[]) => {
    // Position changes are already saved to localStorage via the useEffect
    // No need for debounced save anymore
  }, []);

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

      const id = crypto.randomUUID();

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      const sourceTableData = sourceNode.data as TableNodeData;
      const targetTableData = targetNode.data as TableNodeData;

      // FK column lives in the TARGET (child) table, referencing the SOURCE (parent/owner).
      // Fall back to first column if no single primary key is marked (e.g. composite PK tables).
      const sourcePK =
        sourceTableData.columns?.find((col) => col.isPrimary) ??
        sourceTableData.columns?.[0];
      const sourcePKType = sourcePK?.type ?? "uuid";
      const sourceSingular = (() => {
        const n = sourceTableData.name;
        if (n.endsWith("ies")) return n.slice(0, -3) + "y";
        if (n.endsWith("ses") || n.endsWith("xes") || n.endsWith("zes")) return n.slice(0, -2);
        if (n.endsWith("s")) return n.slice(0, -1);
        return n;
      })();

      // Find existing FK column: prefer name match, fall back to type match
      const targetCols = targetTableData.columns || [];
      const existingFKCol =
        targetCols.find(
          (col) =>
            !col.isPrimary &&
            (col.name === `${sourceTableData.name}_id` ||
              col.name === `${sourceSingular}_id`),
        ) ??
        targetCols.find(
          (col) =>
            !col.isPrimary &&
            col.type === sourcePKType &&
            (col.name.startsWith(sourceTableData.name) ||
              col.name.startsWith(sourceSingular)),
        ) ??
        targetCols.find((col) => !col.isPrimary && col.type === sourcePKType);

      const fkExists = !!existingFKCol;
      const fkColumnName = existingFKCol?.name ?? `${sourceSingular}_id`;

      let updatedTargetColumns = targetCols;
      let newFkColumn = null;

      if (!fkExists) {
        newFkColumn = {
          id: crypto.randomUUID(),
          name: fkColumnName,
          type: sourcePKType,
          isPrimary: false,
          isUnique: false,
          nullable: false,
          defaultValue: null,
          order: updatedTargetColumns.length,
        };
        updatedTargetColumns = [...updatedTargetColumns, newFkColumn];
      }

      const targetFK = updatedTargetColumns.find(
        (col) => col.name === fkColumnName,
      );

      if (!sourcePK || !targetFK) {
        toast.error("Cannot connect: source table has no columns.");
        return;
      }

      // OPTIMISTIC UPDATE: Update UI first
      if (!fkExists && newFkColumn) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === connection.target
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    columns: updatedTargetColumns,
                  },
                }
              : n,
          ),
        );
      }

      const newEdge: Edge = {
        id,
        ...connection,
        type: "relationship",
        data: { type: "one-to-many", projectId },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Save to database with error handling
      try {
        if (!fkExists && newFkColumn) {
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
        }

        await addRelationship({
          data: {
            id,
            sourceTableId: connection.source,
            targetTableId: connection.target,
            sourceColumnId: sourcePK.id,
            targetColumnId: targetFK.id,
            type: "one-to-many",
          },
        });
        // Push to history after successful connection
        pushToHistory(nodesRef.current, edgesRef.current);
      } catch (error) {
        console.error("Failed to create relationship:", error);
        toast.error("Failed to create relationship");

        // REVERT: Remove the edge and FK column on error
        setEdges((eds) => eds.filter((e) => e.id !== id));
        if (!fkExists && newFkColumn) {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === connection.target
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      columns: targetTableData.columns || [],
                    },
                  }
                : n,
            ),
          );
        }
      }
    },
    [projectId, setEdges, nodes, setNodes, pushToHistory],
  );

  // Delete edge — also removes the FK column from the correct table based on type
  const handleDeleteEdge = useCallback(
    async (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      const edgeType = (edge.data as any)?.type || "one-to-many";
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      let fkColumnName: string | null = null;
      let fkTableId: string | null = null;
      let originalColumns: any[] = [];

      if (sourceNode && targetNode) {
        const sourceTableData = sourceNode.data as TableNodeData;
        const targetTableData = targetNode.data as TableNodeData;

        if (edgeType === "many-to-many") {
          // No FK columns in either table (junction table is export-only)
          fkColumnName = null;
        } else if (edgeType === "many-to-one") {
          // FK is in SOURCE table, named after TARGET
          fkColumnName = `${targetTableData.name}_id`;
          fkTableId = edge.source;
          originalColumns = sourceTableData.columns || [];
        } else {
          // one-to-one, one-to-many: FK is in TARGET table, named after SOURCE
          fkColumnName = `${sourceTableData.name}_id`;
          fkTableId = edge.target;
          originalColumns = targetTableData.columns || [];
        }

        if (fkColumnName && fkTableId) {
          const updatedColumns = originalColumns.filter(
            (col) => col.name !== fkColumnName,
          );
          setNodes((nds) =>
            nds.map((n) =>
              n.id === fkTableId
                ? { ...n, data: { ...n.data, columns: [...updatedColumns] } }
                : n,
            ),
          );
        }
      }

      // Snapshot before for potential revert
      const prevNodes = nodesRef.current.map((n) => ({ ...n, data: { ...n.data } }));
      const prevEdges = edgesRef.current.map((e) => ({ ...e, data: { ...e.data } }));

      // OPTIMISTIC UPDATE: Remove edge from UI
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));

      // Save to database with error handling
      try {
        if (sourceNode && targetNode && fkColumnName && fkTableId) {
          const fkNode = fkTableId === edge.source ? sourceNode : targetNode;
          const fkTableData = fkNode.data as TableNodeData;
          const updatedColumns = (fkTableData.columns || []).filter(
            (col) => col.name !== fkColumnName,
          );

          await saveColumns({
            data: {
              tableId: fkTableId,
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
        }

        await deleteRelationship({ data: { id: edgeId, projectId } });

        // Push state to history after successful delete
        const newEdges = edgesRef.current.filter((e) => e.id !== edgeId);
        pushToHistory(nodesRef.current, newEdges);
      } catch (error) {
        console.error("Failed to delete relationship:", error);
        toast.error("Failed to delete relationship");

        // REVERT: Restore edge and FK column on error
        setEdges((eds) => [...eds, edge]);
        if (fkTableId) {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === fkTableId
                ? { ...n, data: { ...n.data, columns: originalColumns } }
                : n,
            ),
          );
        }
      }
    },
    [projectId, setEdges, edges, nodes, setNodes, pushToHistory],
  );

  // Update edge type — also moves FK column to the correct table
  const handleUpdateEdgeType = useCallback(
    async (
      edgeId: string,
      newType: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many",
    ) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      const oldType = (edge.data as any)?.type || "one-to-many";

      // Warn user about many-to-many requiring a junction table
      if (newType === "many-to-many") {
        toast.info(
          "Many-to-many relationships require a junction table. Consider creating a join table manually (e.g. user_roles) with foreign keys to both tables.",
          { duration: 6000 },
        );
      }

      // Determine which table currently has the FK column and which should have it
      // "many" side holds the FK. For one-to-one and one-to-many, FK is on target.
      const oldFKSide =
        oldType === "many-to-one"
          ? "source"
          : oldType === "many-to-many"
            ? "none"
            : "target";
      const newFKSide =
        newType === "many-to-one"
          ? "source"
          : newType === "many-to-many"
            ? "none"
            : "target";

      // Store original state for potential revert
      const originalEdge = { ...edge };

      // OPTIMISTIC UPDATE: Update the edge type in UI
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId ? { ...e, data: { ...e.data, type: newType } } : e,
        ),
      );

      // Handle FK column changes
      if (edge.source && edge.target) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (sourceNode && targetNode) {
          const sourceData = sourceNode.data as TableNodeData;
          const targetData = targetNode.data as TableNodeData;
          const sourcePK =
            sourceData.columns?.find((col) => col.isPrimary) ??
            sourceData.columns?.[0];
          const targetPK =
            targetData.columns?.find((col) => col.isPrimary) ??
            targetData.columns?.[0];

          // FK column names (use singular form, e.g. categories → category_id)
          const toSingular = (n: string) => {
            if (n.endsWith("ies")) return n.slice(0, -3) + "y";
            if (n.endsWith("ses") || n.endsWith("xes") || n.endsWith("zes")) return n.slice(0, -2);
            if (n.endsWith("s")) return n.slice(0, -1);
            return n;
          };
          const sourceFKName = `${toSingular(sourceData.name)}_id`;
          const targetFKName = `${toSingular(targetData.name)}_id`;

          // Track the new column IDs for the relationship
          let newSourceColumnId = sourcePK?.id;
          let newTargetColumnId = targetPK?.id;

          // Store original columns for potential revert
          const originalSourceColumns = [...(sourceData.columns || [])];
          const originalTargetColumns = [...(targetData.columns || [])];

          try {
            // STEP 1: Add new FK column if needed (before removing old one)
            if (newFKSide === "none") {
              // Many-to-many: use primary keys from both tables
              newSourceColumnId = sourcePK?.id;
              newTargetColumnId = targetPK?.id;
            } else if (newFKSide === "source") {
              // Add FK to source table (many-to-one: source references target)
              const fkExists = (sourceData.columns || []).some(
                (col) => col.name === targetFKName,
              );
              if (!fkExists) {
                const newFKId = crypto.randomUUID();
                const updatedColumns = [
                  ...(sourceData.columns || []).filter(
                    (col) => col.name !== targetFKName,
                  ),
                  {
                    id: newFKId,
                    name: targetFKName,
                    type: targetPK?.type || "uuid",
                    isPrimary: false,
                    isUnique: false,
                    nullable: false,
                    defaultValue: null,
                    order: (sourceData.columns || []).length,
                  },
                ];

                // OPTIMISTIC UPDATE: Add FK column to source table
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === edge.source
                      ? {
                          ...n,
                          data: { ...n.data, columns: [...updatedColumns] },
                        }
                      : n,
                  ),
                );

                await saveColumns({
                  data: {
                    tableId: edge.source,
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
                // For many-to-one: source column is the FK, target column is the PK
                newSourceColumnId = newFKId;
                newTargetColumnId = targetPK?.id;
              } else {
                // FK already exists, find its ID
                const existingFK = (sourceData.columns || []).find(
                  (col) => col.name === targetFKName,
                );
                newSourceColumnId = existingFK?.id ?? "";
                newTargetColumnId = targetPK?.id;
              }
            } else if (newFKSide === "target") {
              // Add FK to target table (one-to-many or one-to-one: target references source)
              const fkExists = (targetData.columns || []).some(
                (col) => col.name === sourceFKName,
              );
              if (!fkExists) {
                const newFKId = crypto.randomUUID();
                const updatedColumns = [
                  ...(targetData.columns || []).filter(
                    (col) => col.name !== sourceFKName,
                  ),
                  {
                    id: newFKId,
                    name: sourceFKName,
                    type: sourcePK?.type || "uuid",
                    isPrimary: false,
                    isUnique: false,
                    nullable: false,
                    defaultValue: null,
                    order: (targetData.columns || []).length,
                  },
                ];

                // OPTIMISTIC UPDATE: Add FK column to target table
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === edge.target
                      ? {
                          ...n,
                          data: { ...n.data, columns: [...updatedColumns] },
                        }
                      : n,
                  ),
                );

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
                // For one-to-many/one-to-one: source has PK, target has FK
                newSourceColumnId = sourcePK?.id;
                newTargetColumnId = newFKId;
              } else {
                // FK already exists, find its ID
                const existingFK = (targetData.columns || []).find(
                  (col) => col.name === sourceFKName,
                );
                newSourceColumnId = sourcePK?.id;
                newTargetColumnId = existingFK?.id ?? "";
              }
            }

            // STEP 2: Update the relationship with new column IDs BEFORE deleting old FK
            // This prevents CASCADE delete from removing the relationship
            if (!newSourceColumnId || !newTargetColumnId) {
              toast.error("Cannot update relationship: one of the tables has no columns.");
              // Revert optimistic edge type change
              setEdges((eds) =>
                eds.map((e) =>
                  e.id === edgeId ? { ...e, data: { ...e.data, type: oldType } } : e,
                ),
              );
              return;
            }

            await updateRelationship({
              data: {
                id: edgeId,
                projectId,
                type: newType,
                sourceColumnId: newSourceColumnId,
                targetColumnId: newTargetColumnId,
              },
            });

            // STEP 3: Now safe to remove old FK column
            if (oldFKSide === "source" && newFKSide !== "source") {
              // Remove FK from source table - use nodesRef for fresh data
              const freshSourceNode = nodesRef.current.find((n) => n.id === edge.source);
              if (freshSourceNode) {
                const freshSourceData = freshSourceNode.data as TableNodeData;
                const columnsWithoutFK = (freshSourceData.columns || []).filter(
                  (col) => col.name !== targetFKName,
                );

                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === edge.source
                      ? { ...n, data: { ...n.data, columns: columnsWithoutFK } }
                      : n,
                  ),
                );

                await saveColumns({
                  data: {
                    tableId: edge.source,
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
            } else if (oldFKSide === "target" && newFKSide !== "target") {
              // Remove FK from target table - use nodesRef for fresh data
              const freshTargetNode = nodesRef.current.find((n) => n.id === edge.target);
              if (freshTargetNode) {
                const freshTargetData = freshTargetNode.data as TableNodeData;
                const columnsWithoutFK = (freshTargetData.columns || []).filter(
                  (col) => col.name !== sourceFKName,
                );

                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === edge.target
                      ? { ...n, data: { ...n.data, columns: columnsWithoutFK } }
                      : n,
                  ),
                );

                await saveColumns({
                  data: {
                    tableId: edge.target,
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
            }
          } catch (error) {
            console.error("Failed to update relationship type:", error);
            toast.error("Failed to update relationship type");

            // REVERT: Restore original edge type and columns
            setEdges((eds) =>
              eds.map((e) =>
                e.id === edgeId
                  ? { ...e, data: { ...e.data, type: oldType } }
                  : e,
              ),
            );
            setNodes((nds) =>
              nds.map((n) => {
                if (n.id === edge.source) {
                  return {
                    ...n,
                    data: { ...n.data, columns: originalSourceColumns },
                  };
                }
                if (n.id === edge.target) {
                  return {
                    ...n,
                    data: { ...n.data, columns: originalTargetColumns },
                  };
                }
                return n;
              }),
            );
          }
        }
      } else {
        // No column changes needed, just update the type
        try {
          await updateRelationship({
            data: { id: edgeId, projectId, type: newType },
          });
        } catch (error) {
          console.error("Failed to update relationship type:", error);
          toast.error("Failed to update relationship type");

          // REVERT: Restore original edge type
          setEdges((eds) =>
            eds.map((e) =>
              e.id === edgeId
                ? { ...e, data: { ...e.data, type: oldType } }
                : e,
            ),
          );
        }
      }
    },
    [projectId, setEdges, edges, nodes, setNodes, pushToHistory],
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
    const id = crypto.randomUUID();
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

    // Optimistic update
    setNodes((nds) => [...nds, newNode]);
    setNewTableName("");
    setAddingTable(false);
    setSelectedTableId(id);

    // Save to database
    try {
      await addTable({
        data: {
          id,
          projectId,
          name: sanitizedName,
          color,
          positionX: position.x,
          positionY: position.y,
        },
      });
      toast.success("Table added");
      pushToHistory(nodesRef.current, edgesRef.current);
    } catch (error) {
      console.error("Failed to add table:", error);
      // Revert optimistic update on error
      setNodes((nds) => nds.filter((n) => n.id !== id));
      toast.error("Failed to add table");
    }
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

    // Get the table being deleted to find its name
    const deletedTable = nodes.find((n) => n.id === tableId);
    const deletedTableName = deletedTable
      ? (deletedTable.data as TableNodeData).name
      : null;

    // Find all tables that have FK columns referencing the deleted table
    const fkColumnName = deletedTableName ? `${deletedTableName}_id` : null;
    const affectedTables = fkColumnName
      ? nodes.filter((n) => {
          if (n.id === tableId) return false;
          const tableData = n.data as TableNodeData;
          return tableData.columns?.some((col) => col.name === fkColumnName);
        })
      : [];

    // Optimistic update - remove FK columns from affected tables
    setNodes((nds) =>
      nds
        .filter((n) => n.id !== tableId)
        .map((n) => {
          if (fkColumnName && affectedTables.some((t) => t.id === n.id)) {
            const tableData = n.data as TableNodeData;
            return {
              ...n,
              data: {
                ...n.data,
                columns:
                  tableData.columns?.filter(
                    (col) => col.name !== fkColumnName,
                  ) || [],
              },
            };
          }
          return n;
        }),
    );

    // Remove relationships
    setEdges((eds) =>
      eds.filter((e) => e.source !== tableId && e.target !== tableId),
    );

    if (selectedTableId === tableId) setSelectedTableId(null);
    setDeleteConfirm({ isOpen: false, tableId: null, tableName: "" });

    // Save to database
    try {
      // Remove FK columns from affected tables
      for (const affectedTable of affectedTables) {
        const tableData = affectedTable.data as TableNodeData;
        const updatedColumns =
          tableData.columns?.filter((col) => col.name !== fkColumnName) || [];

        await saveColumns({
          data: {
            tableId: affectedTable.id,
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
      }

      // Delete the table (this will cascade delete relationships and columns)
      await deleteTable({ data: { id: tableId, projectId } });
      toast.success("Table deleted");
      pushToHistory(nodesRef.current, edgesRef.current);
    } catch (error) {
      console.error("Failed to delete table:", error);
      toast.error("Failed to delete table");
      // Note: We don't revert the optimistic update here as it's complex
      // The realtime subscription will handle syncing if needed
    }
  }, [projectId, selectedTableId, nodes, setNodes, setEdges, deleteConfirm]);

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

    // Optimistic update
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

    setSelectedTableId(null);

    // Save to database
    try {
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
          columns: edits.columns.map((c, i) => ({
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

      toast.success("Table saved");
      pushToHistory(nodesRef.current, edgesRef.current);
    } catch (error) {
      console.error("Failed to save table:", error);
      toast.error("Failed to save table");
    }
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

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
    setTimeout(
      () => reactFlowInstance.fitView({ padding: 0.15, duration: 400 }),
      50,
    );
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 rounded-full animate-spin border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left sidebar */}
      <div
        className={clsx(
          "shrink-0 flex flex-col border-r bg-card border-border transition-all duration-300",
          sidebarOpen ? "w-56" : "w-0 border-r-0",
        )}
      >
        <div className={clsx("w-56 flex flex-col flex-1 min-h-0", !sidebarOpen && "hidden")}>
          {/* Logo */}
          <div className="px-4 py-3 border-b flex items-center justify-between border-border">
            <Link
              href="/app"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.jpg"
                alt="Ember Logo"
                width={24}
                height={24}
                className="rounded object-cover"
              />
              <span className="text-xs font-medium text-muted-foreground">
                Projects
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-accent rounded transition-colors"
                title="Close sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m11 17-5-5 5-5" />
                  <path d="m18 17-5-5 5-5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Project name */}
          <div className="px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider mb-1 text-muted-foreground">
              Project
            </p>
            <p className="text-sm font-bold truncate text-card-foreground">
              {project.name}
            </p>
            {project.description && (
              <p className="text-xs mt-0.5 truncate text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>

          {/* Tables list */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Tables ({nodes.length})
              </p>
            </div>
            <div className="space-y-1">
              {nodes.map((n) => {
                const d = n.data as TableNodeData;
                return (
                  <div
                    key={n.id}
                    className={clsx(
                      "group flex items-center gap-2 rounded-lg transition-all border",
                      selectedTableId === n.id
                        ? "bg-accent border-border"
                        : "bg-transparent border-transparent",
                    )}
                  >
                    <button
                      onClick={() => setSelectedTableId(n.id)}
                      className="flex-1 flex items-center gap-2 px-2.5 py-2 text-left"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: d.color }}
                      />
                      <span className="text-xs truncate flex-1 text-foreground">
                        {d.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
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
                <Input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTable();
                    if (e.key === "Escape") setAddingTable(false);
                  }}
                  placeholder="table_name"
                  className="h-8 text-xs"
                  autoFocus
                />
                <div className="flex gap-1.5">
                  <Button
                    onClick={handleAddTable}
                    disabled={!newTableName.trim()}
                    size="sm"
                    className="flex-1 h-7 text-xs"
                  >
                    Add
                  </Button>
                  <Button
                    onClick={() => setAddingTable(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingTable(true)}
                className="w-full mt-2 flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs border border-dashed transition-all text-muted-foreground border-border"
              >
                <span>+</span>
                <span>Add Table</span>
              </button>
            )}
          </div>

          {/* Bottom actions */}
          <div className="p-3 border-t space-y-2 border-border mt-auto">
            <Button
              onClick={handleAutoLayout}
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
            >
              ⊞ Auto Layout
            </Button>
            <Button
              onClick={() => setShowImport(true)}
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
            >
              ↑ Import YAML
            </Button>
            <Button
              onClick={() => setShowExport(true)}
              size="sm"
              className="w-full h-8 text-xs"
            >
              ↓ Export SQL
            </Button>
          </div>
        </div>
      </div>

      {/* Open sidebar button - shows when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-16 left-4 z-20 p-2 rounded-lg bg-card border border-border shadow-lg hover:bg-accent transition-colors"
          title="Open sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Canvas */}
      <div className="flex-1 relative">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 border-b bg-card/80 backdrop-blur-md border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{nodes.length} tables</span>
            <span>·</span>
            <span>{edges.length} relationships</span>
          </div>

          {/* Undo / Redo — top center */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="h-7 w-7 p-0 text-muted-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="h-7 w-7 p-0 text-muted-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
              </svg>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-xs flex items-center gap-1.5 text-muted-foreground">
                <div className="w-3 h-3 border rounded-full animate-spin border-border border-t-primary" />
                Saving...
              </span>
            )}
            <span className="text-xs hidden sm:inline text-muted-foreground">
              Drag from owner → child to connect
            </span>

            <UserMenu user={user} />
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
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border bg-accent border-border">
                ⬡
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">
                Empty Canvas
              </h3>
              <p className="text-sm text-muted-foreground">
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
          relationships={edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            return {
              id: edge.id,
              sourceTableId: edge.source,
              targetTableId: edge.target,
              sourceTableName: (sourceNode?.data as TableNodeData)?.name || "",
              targetTableName: (targetNode?.data as TableNodeData)?.name || "",
              type: (edge.data as any)?.type || "one-to-many",
            };
          })}
          onSave={handleSaveTable}
          onClose={() => setSelectedTableId(null)}
        />
      )}

      {/* Import modal */}
      {showImport && (
        <ImportModal
          projectId={projectId}
          projectName={project.name}
          onClose={() => setShowImport(false)}
          onImported={async () => {
            // Reload project data from database
            const freshProject = await getProject({ data: { id: projectId } });
            const newNodes: Node[] = freshProject.tables.map((table: any, i: number) => ({
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
            const newEdges: Edge[] = freshProject.relationships.map((rel: any) => ({
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
                sourceColumnId: rel.sourceColumnId,
                targetColumnId: rel.targetColumnId,
              },
            }));
            setNodes(newNodes);
            setEdges(newEdges);
            pushToHistory(newNodes, newEdges);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes: newNodes, edges: newEdges, timestamp: Date.now() }));
            localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
            toast.success("Schema imported from YAML");
            setTimeout(() => reactFlowInstance.fitView({ padding: 0.15, duration: 400 }), 100);
          }}
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

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  return (
    <ReactFlowProvider>
      <ERDCanvas params={{ projectId }} />
    </ReactFlowProvider>
  );
}
