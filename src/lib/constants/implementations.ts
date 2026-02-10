import type { Implementation, CategoryConfigMap } from "@/lib/types";

/**
 * Predefined implementation options for each category
 */

export const IMPLEMENTATIONS: Record<string, Implementation[]> = {
  client: [
    {
      id: "client-web",
      name: "Web App",
      category: "client",
      icon: "Globe",
      description: "Browser-based web application",
      color: "#3b82f6",
    },
    {
      id: "client-mobile",
      name: "Mobile App",
      category: "client",
      icon: "Smartphone",
      description: "iOS/Android mobile application",
      color: "#8b5cf6",
    },
    {
      id: "client-desktop",
      name: "Desktop App",
      category: "client",
      icon: "Monitor",
      description: "Native desktop application",
      color: "#6366f1",
    },
  ],
  gateway: [
    {
      id: "gateway-nginx",
      name: "NGINX",
      category: "gateway",
      icon: "Server",
      description: "High-performance web server and reverse proxy",
      color: "#059669",
    },
    {
      id: "gateway-traefik",
      name: "Traefik",
      category: "gateway",
      icon: "Server",
      description: "Cloud-native edge router",
      color: "#10b981",
    },
    {
      id: "gateway-kong",
      name: "Kong",
      category: "gateway",
      icon: "Server",
      description: "API gateway and microservices management",
      color: "#14b8a6",
    },
    {
      id: "gateway-aws",
      name: "AWS API Gateway",
      category: "gateway",
      icon: "Cloud",
      description: "Fully managed API gateway service",
      color: "#f59e0b",
    },
  ],
  loadbalancer: [
    {
      id: "lb-nginx",
      name: "NGINX",
      category: "loadbalancer",
      icon: "Network",
      description: "Layer 7 load balancing",
      color: "#059669",
    },
    {
      id: "lb-haproxy",
      name: "HAProxy",
      category: "loadbalancer",
      icon: "Network",
      description: "High-availability load balancer",
      color: "#10b981",
    },
    {
      id: "lb-aws-alb",
      name: "AWS ALB",
      category: "loadbalancer",
      icon: "Cloud",
      description: "Application Load Balancer",
      color: "#f59e0b",
    },
    {
      id: "lb-aws-nlb",
      name: "AWS NLB",
      category: "loadbalancer",
      icon: "Cloud",
      description: "Network Load Balancer",
      color: "#fb923c",
    },
  ],
  service: [
    {
      id: "service-rest",
      name: "REST Service",
      category: "service",
      icon: "Box",
      description: "RESTful API service",
      color: "#3b82f6",
    },
    {
      id: "service-grpc",
      name: "gRPC Service",
      category: "service",
      icon: "Box",
      description: "High-performance RPC framework",
      color: "#6366f1",
    },
    {
      id: "service-graphql",
      name: "GraphQL Service",
      category: "service",
      icon: "Box",
      description: "Query language for APIs",
      color: "#8b5cf6",
    },
  ],
  cache: [
    {
      id: "cache-redis",
      name: "Redis",
      category: "cache",
      icon: "Database",
      description: "In-memory data structure store",
      color: "#dc2626",
    },
    {
      id: "cache-memcached",
      name: "Memcached",
      category: "cache",
      icon: "Database",
      description: "Distributed memory caching system",
      color: "#ef4444",
    },
  ],
  queue: [
    {
      id: "queue-rabbitmq",
      name: "RabbitMQ",
      category: "queue",
      icon: "ListTree",
      description: "Message broker with multiple protocols",
      color: "#f97316",
    },
    {
      id: "queue-kafka",
      name: "Kafka",
      category: "queue",
      icon: "ListTree",
      description: "Distributed event streaming platform",
      color: "#ea580c",
    },
    {
      id: "queue-sqs",
      name: "AWS SQS",
      category: "queue",
      icon: "Cloud",
      description: "Fully managed message queuing service",
      color: "#f59e0b",
    },
    {
      id: "queue-pubsub",
      name: "Google Pub/Sub",
      category: "queue",
      icon: "Cloud",
      description: "Asynchronous messaging service",
      color: "#fb923c",
    },
  ],
  storage: [
    {
      id: "storage-postgres",
      name: "PostgreSQL",
      category: "storage",
      icon: "Database",
      description: "Advanced open-source relational database",
      color: "#0284c7",
    },
    {
      id: "storage-mysql",
      name: "MySQL",
      category: "storage",
      icon: "Database",
      description: "Popular open-source relational database",
      color: "#0ea5e9",
    },
    {
      id: "storage-oracle",
      name: "Oracle SQL",
      category: "storage",
      icon: "Database",
      description: "Enterprise relational database",
      color: "#06b6d4",
    },
    {
      id: "storage-mongodb",
      name: "MongoDB",
      category: "storage",
      icon: "Database",
      description: "NoSQL document database",
      color: "#059669",
    },
    {
      id: "storage-dynamodb",
      name: "DynamoDB",
      category: "storage",
      icon: "Cloud",
      description: "Managed NoSQL database service",
      color: "#f59e0b",
    },
  ],
  worker: [
    {
      id: "worker-generic",
      name: "Background Worker",
      category: "worker",
      icon: "Cog",
      description: "Asynchronous task processor",
      color: "#7c3aed",
    },
    {
      id: "worker-celery",
      name: "Celery",
      category: "worker",
      icon: "Cog",
      description: "Distributed task queue (Python)",
      color: "#8b5cf6",
    },
    {
      id: "worker-sidekiq",
      name: "Sidekiq",
      category: "worker",
      icon: "Cog",
      description: "Background job processor (Ruby)",
      color: "#a855f7",
    },
  ],
  external: [
    {
      id: "external-api",
      name: "Third-Party API",
      category: "external",
      icon: "ExternalLink",
      description: "External service or API",
      color: "#64748b",
    },
    {
      id: "external-payment",
      name: "Payment Gateway",
      category: "external",
      icon: "CreditCard",
      description: "Payment processing service",
      color: "#475569",
    },
    {
      id: "external-auth",
      name: "Auth Provider",
      category: "external",
      icon: "Shield",
      description: "Authentication service (OAuth, SAML)",
      color: "#334155",
    },
  ],
};

/**
 * Category configurations for styling and metadata
 */
export const CATEGORY_CONFIGS: CategoryConfigMap = {
  client: {
    label: "Client",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: "Users",
    description: "Client applications and user interfaces",
  },
  gateway: {
    label: "API Gateway",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: "GanttChart",
    description: "API gateways and reverse proxies",
  },
  loadbalancer: {
    label: "Load Balancer",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    icon: "Network",
    description: "Traffic distribution and load balancing",
  },
  service: {
    label: "Service",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    borderColor: "border-blue-600/30",
    icon: "Box",
    description: "Microservices and API endpoints",
  },
  cache: {
    label: "Cache",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: "Zap",
    description: "In-memory caching layers",
  },
  queue: {
    label: "Message Queue",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    icon: "ListTree",
    description: "Message brokers and event streams",
  },
  storage: {
    label: "Database",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    icon: "Database",
    description: "Data persistence and storage",
  },
  worker: {
    label: "Worker",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    icon: "Cog",
    description: "Background job processors",
  },
  external: {
    label: "External Service",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    icon: "ExternalLink",
    description: "Third-party APIs and services",
  },
  custom: {
    label: "Custom",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    icon: "Sparkles",
    description: "User-defined custom elements",
  },
};

/**
 * Get all implementations for a specific category
 */
export function getImplementationsForCategory(
  category: string,
): Implementation[] {
  return IMPLEMENTATIONS[category] || [];
}

/**
 * Get a specific implementation by ID
 */
export function getImplementationById(id: string): Implementation | undefined {
  for (const implementations of Object.values(IMPLEMENTATIONS)) {
    const found = implementations.find((impl) => impl.id === id);
    if (found) return found;
  }
  return undefined;
}
