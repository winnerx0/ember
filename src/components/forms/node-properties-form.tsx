"use client";

import { useCanvasStore } from "@/stores/canvas-store";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { NodeData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { findAffectedNodesAndEdges } from "@/lib/analysis/graph";
import { AlertCircle, Zap } from "lucide-react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

const formSchema = z.object({
  label: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  techStack: z.string().optional(),
  databaseType: z.string().optional(),
  deploymentType: z.string().optional(),
  scalingStrategy: z
    .enum(["horizontal", "vertical"])
    .optional()
    .default("horizontal"),
  healthStatus: z
    .enum(["healthy", "degraded", "down"])
    .optional()
    .default("healthy"),
});

type NodePropertiesFormValues = z.infer<typeof formSchema>;

export function NodePropertiesForm() {
  const { selectedNodeId, nodes, edges, updateNode, setHighlights, clearHighlights } = useCanvasStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const { toast } = useToast();

  const form = useForm<NodePropertiesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      techStack: "",
      databaseType: "",
      deploymentType: "",
      scalingStrategy: "horizontal",
      healthStatus: "healthy",
    },
  });

  useEffect(() => {
    if (selectedNode) {
      form.reset(selectedNode.data);
    }
  }, [selectedNode, form]);

  if (!selectedNode) {
    return null;
  }

  const onSubmit = (values: NodePropertiesFormValues) => {
    updateNode(selectedNode.id, values);
  };

  // Trigger form submission on blur
  const handleBlur = () => {
    form.handleSubmit(onSubmit)();
  };

  const handleSimulateFailure = () => {
    if (selectedNodeId) {
      // First, update the node's health status
      updateNode(selectedNodeId, { healthStatus: "down" });

      // Then, find affected nodes and edges
      const { affectedNodes, affectedEdges } = findAffectedNodesAndEdges(
        selectedNodeId,
        nodes,
        edges,
      );

      // Highlight them
      setHighlights(affectedNodes, affectedEdges);

      toast({
        title: "Failure Simulation Active",
        description: `Simulating failure for "${selectedNode.data.label}". ${affectedNodes.length} services affected.`,
        variant: "destructive",
      });
    }
  };

  const handleClearSimulation = () => {
    if (selectedNodeId) {
      updateNode(selectedNodeId, { healthStatus: "healthy" });
    }
    clearHighlights();
    toast({
      title: "Simulation Cleared",
      description: "Service failure simulation has been removed.",
    });
  };

  return (
    <Form {...form}>
      <form
        onChange={handleBlur} // This might be too aggressive, consider a save button
        className="space-y-4 p-4"
      >
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} onBlur={handleBlur} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} onBlur={handleBlur} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="techStack"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tech Stack</FormLabel>
              <FormControl>
                <Input {...field} onBlur={handleBlur} placeholder="e.g., Go, Java, Node" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="databaseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Database Type</FormLabel>
              <FormControl>
                <Input {...field} onBlur={handleBlur} placeholder="e.g., Postgres, MongoDB" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deploymentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deployment Type</FormLabel>
              <FormControl>
                <Input {...field} onBlur={handleBlur} placeholder="e.g., Container, Serverless, VM" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scalingStrategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scaling Strategy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a strategy" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="healthStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Health Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="degraded">Degraded</SelectItem>
                  <SelectItem value="down">Down</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="destructive"
            onClick={handleSimulateFailure}
            className="flex-1"
          >
            <Zap className="h-4 w-4 mr-2" /> Simulate Failure
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClearSimulation}
            className="flex-1"
          >
            <AlertCircle className="h-4 w-4 mr-2" /> Clear Simulation
          </Button>
        </div>
      </form>
    </Form>
  );
}
