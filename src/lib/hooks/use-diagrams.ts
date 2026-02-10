"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Diagram } from "@/lib/types";

// Fetch all diagrams
export function useDiagrams() {
  return useQuery({
    queryKey: ["diagrams"],
    queryFn: async () => {
      const response = await fetch("/api/diagrams");
      if (!response.ok) {
        throw new Error("Failed to fetch diagrams");
      }
      const data = await response.json();
      return data.diagrams as Diagram[];
    },
  });
}

// Fetch single diagram
export function useDiagram(id: string | null) {
  return useQuery({
    queryKey: ["diagrams", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/diagrams/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch diagram");
      }
      const data = await response.json();
      return data.diagram as Diagram;
    },
    enabled: !!id,
  });
}

// Create diagram mutation
export function useCreateDiagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (diagram: {
      title: string;
      description?: string;
      data: any;
    }) => {
      const response = await fetch("/api/diagrams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diagram),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create diagram");
      }

      const data = await response.json();
      return data.diagram as Diagram;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagrams"] });
    },
  });
}

// Update diagram mutation
export function useUpdateDiagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      diagram,
    }: {
      id: string;
      diagram: { title: string; description?: string; data: any };
    }) => {
      const response = await fetch(`/api/diagrams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diagram),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update diagram");
      }

      const data = await response.json();
      return data.diagram as Diagram;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diagrams"] });
      queryClient.invalidateQueries({ queryKey: ["diagrams", variables.id] });
    },
  });
}

// Delete diagram mutation
export function useDeleteDiagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/diagrams/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete diagram");
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagrams"] });
    },
  });
}
