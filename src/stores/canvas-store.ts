import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Node, Edge, Viewport } from "reactflow";
import type { NodeData, DiagramNode, DiagramEdge } from "@/lib/types";

interface CanvasState {
  // Diagram metadata
  diagramId: string | null;
  diagramTitle: string;
  diagramDescription: string;

  // Canvas data
  nodes: Node<NodeData>[];
  edges: Edge[];

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

  // UI state
  isPropertiesPanelOpen: boolean;
  isSaving: boolean;
}

interface CanvasActions {
  // Diagram actions
  setDiagramId: (id: string | null) => void;
  setDiagramTitle: (title: string) => void;
  setDiagramDescription: (description: string) => void;

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
  selectedNodeId: null,
  selectedEdgeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  history: [],
  historyIndex: -1,
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
        description: data.description,
        implementation: data.implementation,
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
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));

    get().addToHistory();
  },

  updateEdge: (id, data) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id ? { ...edge, data: { ...edge.data, ...data } } : edge,
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

  // UI actions
  togglePropertiesPanel: () =>
    set((state) => ({ isPropertiesPanelOpen: !state.isPropertiesPanelOpen })),
  setIsSaving: (isSaving) => set({ isSaving }),

  // Load diagram
  loadDiagram: (diagram) => {
    set({
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
