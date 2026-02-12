"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import type { EdgeData } from "@/lib/types";

const formSchema = z.object({
  label: z.string().optional(),
  communicationType: z
    .enum(["rest", "grpc", "kafka", "rabbitmq"])
    .optional()
    .default("rest"),
  isAsync: z.boolean().optional().default(false),
  authenticationType: z.string().optional(),
  latency: z.coerce.number().optional(),
  retryStrategy: z.string().optional(),
});

type EdgePropertiesFormValues = z.infer<typeof formSchema>;

export function EdgePropertiesForm() {
  const { selectedEdgeId, edges, updateEdge } = useCanvasStore();
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  const form = useForm<EdgePropertiesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      communicationType: "rest",
      isAsync: false,
      authenticationType: "",
      latency: 0,
      retryStrategy: "",
    },
  });

  useEffect(() => {
    if (selectedEdge?.data) {
      form.reset(selectedEdge.data);
    }
  }, [selectedEdge, form]);

  if (!selectedEdge) {
    return null;
  }

  const onSubmit = (values: EdgePropertiesFormValues) => {
    updateEdge(selectedEdge.id, values);
  };

  const handleBlur = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <Form {...form}>
      <form onChange={handleBlur} className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} onBlur={handleBlur} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="communicationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="rest">REST</SelectItem>
                  <SelectItem value="grpc">gRPC</SelectItem>
                  <SelectItem value="kafka">Kafka</SelectItem>
                  <SelectItem value="rabbitmq">RabbitMQ</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isAsync"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Asynchronous</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="authenticationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authentication</FormLabel>
              <FormControl>
                <Input {...field} onBlur={handleBlur} placeholder="e.g., API Key, OAuth" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="latency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latency (ms)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onBlur={handleBlur} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="retryStrategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retry Strategy</FormLabel>
              <FormControl>
                <Input {...field} onBlur={handleBlur} placeholder="e.g., Exponential backoff" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
