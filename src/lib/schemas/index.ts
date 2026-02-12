import { z } from "zod";
import type { NodeCategory } from "@/lib/types";

/**
 * Zod validation schemas for runtime type checking
 */

// Node Category Schema
export const nodeCategorySchema = z.enum([
  "client",
  "gateway",
  "loadbalancer",
  "service",
  "cache",
  "queue",
  "storage",
  "worker",
  "external",
  "custom",
]);

// Implementation Schema
export const implementationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  category: nodeCategorySchema,
  icon: z.string(),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
  color: z.string().optional(),
});

// Node Data Schema
export const nodeDataSchema = z.object({
  label: z.string().min(1, "Label is required"),
  category: nodeCategorySchema,
  implementation: implementationSchema.optional(),
  metadata: z.record(z.any()).default({}),
  description: z.string().optional(),
});

// Diagram Node Schema
export const diagramNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: nodeDataSchema,
});

// Diagram Edge Schema
export const diagramEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
  label: z.string().optional(),
});

// Diagram Schema
export const diagramSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  nodes: z.array(diagramNodeSchema),
  edges: z.array(diagramEdgeSchema),
  userId: z.string().optional(),
});

// Custom Element Schema
export const customElementSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  category: nodeCategorySchema,
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description too long"),
  icon: z.string().min(1, "Icon is required"),
  metadata: z.record(z.any()).optional(),
});

// Save Diagram Input Schema
export const saveDiagramInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  data: z.object({
    nodes: z.array(diagramNodeSchema),
    edges: z.array(diagramEdgeSchema),
  }),
});

// Update Node Input Schema
export const updateNodeInputSchema = z.object({
  label: z.string().min(1).optional(),
  implementation: implementationSchema.optional(),
  metadata: z.record(z.any()).optional(),
  description: z.string().optional(),
});

// Export types inferred from schemas
export type DiagramInput = z.infer<typeof diagramSchema>;
export type CustomElementInput = z.infer<typeof customElementSchema>;
export type SaveDiagramInput = z.infer<typeof saveDiagramInputSchema>;
export type UpdateNodeInput = z.infer<typeof updateNodeInputSchema>;
