/**
 * Core type definitions for the System Design Canvas
 */

// Node Categories
export type NodeCategory =
  | "client"
  | "gateway"
  | "loadbalancer"
  | "service"
  | "cache"
  | "queue"
  | "storage"
  | "worker"
  | "external"
  | "custom";

// Generic System Element
export interface GenericElement {
  id: string;
  category: NodeCategory;
  label: string;
  description: string;
}

// Implementation Option
export interface Implementation {
  id: string;
  name: string;
  category: NodeCategory;
  icon: string;
  description: string;
  metadata?: Record<string, any>;
  color?: string;
}

// Node Data Structure
export interface NodeData {
  label: string;
  category: NodeCategory;
  implementation?: Implementation;
  metadata: Record<string, any>;
  description?: string;
  // Microservice specific properties
  techStack?: string;
  databaseType?: string;
  deploymentType?: string;
  scalingStrategy?: "vertical" | "horizontal";
  healthStatus?: "healthy" | "degraded" | "down";
}

// Edge Data Structure
export interface EdgeData {
  label?: string;
  communicationType?: "rest" | "grpc" | "kafka" | "rabbitmq";
  isAsync?: boolean;
  authenticationType?: string;
  latency?: number;
  retryStrategy?: string;
}

// Diagram Node (extends React Flow Node)
export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

// Diagram Edge (extends React Flow Edge)
export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  data?: EdgeData;
}

// Complete Diagram
export interface Diagram {
  id: string;
  title: string;
  description?: string;
  data: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
  created_at: string;
  updated_at: string;
  user_id?: string;
}

// Custom Element (user-defined)
export interface CustomElement {
  id: string;
  userId?: string;
  name: string;
  category: NodeCategory;
  description: string;
  icon: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Database Types (Supabase)
export interface Database {
  public: {
    Tables: {
      diagrams: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          description: string | null;
          data: {
            nodes: DiagramNode[];
            edges: DiagramEdge[];
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          description?: string | null;
          data: {
            nodes: DiagramNode[];
            edges: DiagramEdge[];
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          description?: string | null;
          data?: {
            nodes: DiagramNode[];
            edges: DiagramEdge[];
          };
          updated_at?: string;
        };
      };
      custom_elements: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          category: NodeCategory;
          description: string;
          icon: string;
          metadata: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          category: NodeCategory;
          description: string;
          icon: string;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          category?: NodeCategory;
          description?: string;
          icon?: string;
          metadata?: Record<string, any> | null;
        };
      };
    };
  };
}

// Node Metrics for Observability Mode
export interface NodeMetrics {
  requestRate: number; // requests per second
  errorRate: number; // percentage
  latency: number; // milliseconds
}

// Category Metadata
export interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  description: string;
}

export type CategoryConfigMap = Record<NodeCategory, CategoryConfig>;
