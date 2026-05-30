import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const admin = createAdminClient();

    const [monthlyRes, unscheduledRes] = await Promise.all([
      (admin as any)
        .from("content_packages")
        .select("*")
        .eq("is_saved", true)
        .gte("created_at", startDate)
        .lte("created_at", `${endDate}T23:59:59.999Z`),
      (admin as any)
        .from("content_packages")
        .select("*")
        .eq("is_saved", true)
        .is("scheduled_date", null),
    ]);

    return NextResponse.json({
      status: "success",
      packages: [...(monthlyRes.data ?? []), ...(unscheduledRes.data ?? [])],
    });
  } catch (error) {
    console.error("[API] Erro no calendário:", error);
    return NextResponse.json(
      { status: "error", message: "Erro interno" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ status: "error", message: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { package_id, scheduled_date } = body;

    if (!package_id) {
      return NextResponse.json({ status: "error", message: "package_id é obrigatório" }, { status: 400 });
    }

    const admin = createAdminClient();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (scheduled_date) {
      updates.scheduled_date = scheduled_date;
      updates.status = "scheduled";
    } else {
      updates.scheduled_date = null;
      updates.status = "draft";
    }

    const { error } = await (admin as any)
      .from("content_packages")
      .update(updates)
      .eq("id", package_id);

    if (error) {
      console.error("[API] Erro ao agendar:", error);
      return NextResponse.json({ status: "error", message: "Erro ao agendar" }, { status: 500 });
    }

    return NextResponse.json({ status: "success", message: "Conteúdo agendado" });
  } catch (error) {
    console.error("[API] Erro ao agendar:", error);
    return NextResponse.json({ status: "error", message: "Erro interno" }, { status: 500 });
  }
}
