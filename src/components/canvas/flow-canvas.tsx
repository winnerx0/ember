"use client";

import { useCallback, DragEvent } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";

import { useCanvasStore } from "@/stores/canvas-store";
import { BaseNode } from "@/components/nodes/base-node";
import type { NodeData, NodeCategory } from "@/lib/types";

import { LabeledEdge } from "@/components/edges/labeled-edge";
import { Legend } from "@/components/canvas/legend";

// Register custom node types
const nodeTypes = {
  client: BaseNode,
  gateway: BaseNode,
  loadbalancer: BaseNode,
  service: BaseNode,
  cache: BaseNode,
  queue: BaseNode,
  storage: BaseNode,
  worker: BaseNode,
  external: BaseNode,
  custom: BaseNode,
};

// Register custom edge types
const edgeTypes = {
  default: LabeledEdge,
  smoothstep: LabeledEdge,
};

const categoryLabels: Record<NodeCategory, string> = {
  client: "Client",
  gateway: "API Gateway",
  loadbalancer: "Load Balancer",
  service: "Service",
  cache: "Cache",
  queue: "Message Queue",
  storage: "Database",
  worker: "Worker",
  external: "External Service",
  custom: "Custom",
};

export function FlowCanvas() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addEdge: addEdgeToStore,
    addNode,
    selectNode,
    selectEdge,
  } = useCanvasStore();

  const { screenToFlowPosition } = useReactFlow();

  // Handle node changes (position, selection, etc.)
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes(applyNodeChanges(changes, nodes) as Node<NodeData>[]);
    },
    [nodes, setNodes],
  );

  // Handle edge changes
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges],
  );

  // Handle new connection
  const onConnect: OnConnect = useCallback(
    (connection) => {
      const newEdge = {
        ...connection,
        type: "smoothstep",
        animated: true,
      } as Edge;

      addEdgeToStore(newEdge);
    },
    [addEdgeToStore],
  );

  // Handle node click
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  // Handle edge click
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      selectEdge(edge.id);
    },
    [selectEdge],
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  // Handle drag over - required for drop to work
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop - add node to canvas
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const category = event.dataTransfer.getData(
        "application/reactflow",
      ) as NodeCategory;

      if (!category) {
        return;
      }

      // Get position where user dropped the node
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(
        category,
        {
          label: categoryLabels[category] || "New Node",
          category,
          metadata: {},
        },
        position,
      );
    },
    [screenToFlowPosition, addNode],
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-background"
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
        }}
      >
        {/* Grid background */}
        <Background gap={20} size={1} className="bg-muted" />

        {/* MiniMap */}
        <MiniMap
          className="bg-background border border-border"
          nodeClassName="fill-primary/20"
        />

        {/* Controls */}
        <Controls
          className="bg-background border border-border rounded-lg"
          showInteractive={false}
        />

        {/* Legend */}
        <Legend />
      </ReactFlow>
    </div>
  );
}
