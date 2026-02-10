import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveDiagramInputSchema } from "@/lib/schemas";

// GET /api/diagrams/[id] - Load specific diagram
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    const { data, error } = await supabase
      .from("diagrams")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Diagram not found" },
          { status: 404 },
        );
      }
      console.error("Error fetching diagram:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ diagram: data });
  } catch (error) {
    console.error("Error in GET /api/diagrams/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/diagrams/[id] - Update diagram
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    const body = await request.json();

    // Validate input
    const validatedData = saveDiagramInputSchema.parse(body);

    const { data, error } = await supabase
      .from("diagrams")
      .update({
        title: validatedData.title,
        description: validatedData.description,
        data: validatedData.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating diagram:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ diagram: data });
  } catch (error: any) {
    console.error("Error in PUT /api/diagrams/[id]:", error);

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

// DELETE /api/diagrams/[id] - Delete diagram
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    const { error } = await supabase.from("diagrams").delete().eq("id", id);

    if (error) {
      console.error("Error deleting diagram:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/diagrams/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
