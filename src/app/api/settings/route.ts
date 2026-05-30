import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ status: "error", message: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ status: "error", message: "Perfil não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ status: "success", profile });
  } catch (error) {
    console.error("[API] Erro ao buscar perfil:", error);
    return NextResponse.json({ status: "error", message: "Erro interno" }, { status: 500 });
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
    const { name, market, role } = body;

    const admin = createAdminClient();
    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (market) updates.market = market;
    if (role) updates.role = role;

    const { error } = await (admin as any)
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("[API] Erro ao atualizar perfil:", error);
      return NextResponse.json({ status: "error", message: "Erro ao guardar" }, { status: 500 });
    }

    return NextResponse.json({ status: "success", message: "Perfil atualizado" });
  } catch (error) {
    console.error("[API] Erro ao atualizar perfil:", error);
    return NextResponse.json({ status: "error", message: "Erro interno" }, { status: 500 });
  }
}
