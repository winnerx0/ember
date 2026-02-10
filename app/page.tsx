"use client";

import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDiagrams } from "@/lib/hooks/use-diagrams";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const { data: diagrams, isLoading } = useDiagrams();

  const handleNewDiagram = () => {
    router.push("/canvas/new");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            System Design Canvas
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create and visualize backend and distributed system architectures
            with professional, industry-standard components.
          </p>
        </div>

        {/* New Diagram Button */}
        <div className="flex justify-center mb-12">
          <Button
            size="lg"
            onClick={handleNewDiagram}
            className="gap-2 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New Diagram
          </Button>
        </div>

        {/* Recent Diagrams */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Your Diagrams</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : diagrams && diagrams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diagrams.map((diagram) => (
                <Link key={diagram.id} href={`/canvas/${diagram.id}`}>
                  <Card className="hover:shadow-lg transition-all cursor- pointer hover:scale-105 duration-200">
                    <CardHeader>
                      <CardTitle className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{diagram.title}</span>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {diagram.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {diagram.data?.nodes?.length || 0} nodes,{" "}
                          {diagram.data?.edges?.length || 0} connections
                        </span>
                        <span>
                          {new Date(diagram.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center mb-4">
                  No diagrams yet. Create your first system design diagram to
                  get started!
                </p>
                <Button
                  onClick={handleNewDiagram}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Diagram
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎯 Industry Standard</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use real-world technologies like PostgreSQL, Redis, Kafka, AWS
              services, and more.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                🎨 Visual & Professional
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Color-coded components with modern design perfect for
              presentations and interviews.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💾 Auto-Save</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Your work is automatically saved to the cloud and accessible from
              anywhere.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
