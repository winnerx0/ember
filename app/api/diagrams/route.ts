import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveDiagramInputSchema } from "@/lib/schemas";

// GET /api/diagrams - List all diagrams
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("diagrams")
      .select("id, title, description, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching diagrams:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ diagrams: data });
  } catch (error) {
    console.error("Error in GET /api/diagrams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/diagrams - Create new diagram
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate input
    const validatedData = saveDiagramInputSchema.parse(body);

    const { data, error } = await supabase
      .from("diagrams")
      .insert([
        {
          title: validatedData.title,
          description: validatedData.description,
          data: validatedData.data,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating diagram:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ diagram: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/diagrams:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
