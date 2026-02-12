import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Node, Edge, Viewport } from "reactflow";
import type {
  NodeData,
  DiagramNode,
  DiagramEdge,
  NodeCategory,
  NodeMetrics,
} from "@/lib/types";

export type EdgeType = "default" | "straight" | "step" | "smoothstep";

export interface CustomElement {
  id: string;
  name: string;
  category: NodeCategory;
  description: string;
  icon: string;
}

interface CanvasState {
  // Diagram metadata
  diagramId: string | null;
  diagramTitle: string;
  diagramDescription: string;

  // Canvas data
  nodes: Node<NodeData>[];
  edges: Edge[];

  // Custom elements
  customElements: CustomElement[];

  // Edge type
  edgeType: EdgeType;

  // Selection
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // Viewport
  viewport: Viewport;

  // History for undo/redo
  history: {
    nodes: Node<NodeData>[];
    edges: Edge[];
  }[];
  historyIndex: number;

  // Analysis
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;

  // Observability
  isObservabilityMode: boolean;
  nodeMetrics: Map<string, NodeMetrics>;

  // UI state
  isPropertiesPanelOpen: boolean;
  isSaving: boolean;
}

interface CanvasActions {
  // Diagram actions
  setDiagramId: (id: string | null) => void;
  setDiagramTitle: (title: string) => void;
  setDiagramDescription: (description: string) => void;

  // Custom element actions
  addCustomElement: (element: Omit<CustomElement, "id">) => void;
  deleteCustomElement: (id: string) => void;

  // Edge type actions
  setEdgeType: (edgeType: EdgeType) => void;

  // Node actions
  addNode: (
    type: string,
    data: Partial<NodeData>,
    position: { x: number; y: number },
  ) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;

  // Edge actions
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, data: any) => void;
  deleteEdge: (id: string) => void;
  setEdges: (edges: Edge[]) => void;

  // Selection actions
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;

  // Viewport actions
  setViewport: (viewport: Viewport) => void;

  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addToHistory: () => void;
  clearHistory: () => void;

  // Analysis actions
  setHighlights: (nodeIds: string[], edgeIds: string[]) => void;
  clearHighlights: () => void;

  // Observability actions
  toggleObservabilityMode: () => void;
  setNodeMetrics: (metrics: Map<string, NodeMetrics>) => void;

  // UI actions
  togglePropertiesPanel: () => void;
  setIsSaving: (isSaving: boolean) => void;

  // Load diagram
  loadDiagram: (diagram: {
    id: string;
    title: string;
    description?: string;
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  }) => void;

  // Reset canvas
  reset: () => void;
}

type CanvasStore = CanvasState & CanvasActions;

const initialState: CanvasState = {
  diagramId: null,
  diagramTitle: "Untitled Diagram",
  diagramDescription: "",
  nodes: [],
  edges: [],
  customElements: [],
  edgeType: "straight",
  selectedNodeId: null,
  selectedEdgeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  history: [],
  historyIndex: -1,
  highlightedNodes: new Set(),
  highlightedEdges: new Set(),
  isObservabilityMode: false,
  nodeMetrics: new Map(),
  isPropertiesPanelOpen: false,
  isSaving: false,
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  ...initialState,

  // Diagram actions
  setDiagramId: (id) => set({ diagramId: id }),
  setDiagramTitle: (title) => set({ diagramTitle: title }),
  setDiagramDescription: (description) =>
    set({ diagramDescription: description }),

  // Custom element actions
  addCustomElement: (element) => {
    const newElement: CustomElement = {
      ...element,
      id: nanoid(),
    };
    set((state) => ({
      customElements: [...state.customElements, newElement],
    }));
  },

  deleteCustomElement: (id) => {
    set((state) => ({
      customElements: state.customElements.filter((el) => el.id !== id),
    }));
  },

  // Edge type actions
  setEdgeType: (edgeType) => set({ edgeType }),

  // Node actions
  addNode: (type, data, position) => {
    const newNode: Node<NodeData> = {
      id: nanoid(),
      type,
      position,
      data: {
        label: data.label || "New Node",
        category: data.category || "service",
        metadata: data.metadata || {},
        description: data.description || "",
        implementation: data.implementation,
        techStack: "",
        databaseType: "",
        deploymentType: "",
        scalingStrategy: "horizontal",
        healthStatus: "healthy",
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
      isPropertiesPanelOpen: true,
    }));

    get().addToHistory();
  },

  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node,
      ),
    }));

    get().addToHistory();
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id,
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));

    get().addToHistory();
  },

  setNodes: (nodes) => set({ nodes }),

  // Edge actions
  addEdge: (edge) => {
    const newEdge: Edge = {
      ...edge,
      id: edge.id || nanoid(),
      data: {
        label: "New Connection",
        communicationType: "rest",
        isAsync: false,
        authenticationType: "None",
        latency: 100,
        retryStrategy: "None",
      },
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
      selectedEdgeId: newEdge.id,
      isPropertiesPanelOpen: true,
    }));

    get().addToHistory();
  },

  updateEdge: (id, data) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id
          ? { ...edge, data: { ...(edge.data || {}), ...data } }
          : edge,
      ),
    }));

    get().addToHistory();
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
    }));

    get().addToHistory();
  },

  setEdges: (edges) => set({ edges }),

  // Selection actions
  selectNode: (id) =>
    set({ selectedNodeId: id, isPropertiesPanelOpen: id !== null }),
  selectEdge: (id) => set({ selectedEdgeId: id }),

  // Viewport actions
  setViewport: (viewport) => set({ viewport }),

  // History actions
  addToHistory: () => {
    const { nodes, edges, history, historyIndex } = get();

    // Remove any history after current index
    const newHistory = history.slice(0, historyIndex + 1);

    // Add current state
    newHistory.push({ nodes: [...nodes], edges: [...edges] });

    // Keep only last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();

    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      set({
        nodes: previousState.nodes,
        edges: previousState.edges,
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();

    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        historyIndex: historyIndex + 1,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  clearHistory: () => set({ history: [], historyIndex: -1 }),

  // Analysis actions
  setHighlights: (nodeIds, edgeIds) =>
    set({
      highlightedNodes: new Set(nodeIds),
      highlightedEdges: new Set(edgeIds),
    }),
  clearHighlights: () =>
    set({ highlightedNodes: new Set(), highlightedEdges: new Set() }),

  // Observability actions
  toggleObservabilityMode: () =>
    set((state) => ({ isObservabilityMode: !state.isObservabilityMode })),
  setNodeMetrics: (metrics) => set({ nodeMetrics: metrics }),

  // UI actions
  togglePropertiesPanel: () =>
    set((state) => ({ isPropertiesPanelOpen: !state.isPropertiesPanelOpen })),
  setIsSaving: (isSaving) => set({ isSaving }),

  // Load diagram
  loadDiagram: (diagram) => {
    set({
      ...initialState,
      diagramId: diagram.id,
      diagramTitle: diagram.title,
      diagramDescription: diagram.description || "",
      nodes: diagram.nodes as Node<NodeData>[],
      edges: diagram.edges as Edge[],
    });

    get().clearHistory();
    get().addToHistory();
  },

  // Reset canvas
  reset: () => {
    set(initialState);
    get().clearHistory();
  },
}));
