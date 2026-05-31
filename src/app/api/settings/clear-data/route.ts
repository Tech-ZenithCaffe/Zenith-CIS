import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ status: "error", message: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ status: "error", message: "action é obrigatório" }, { status: 400 });
    }

    const admin = createAdminClient();

    switch (action) {
      case "pending": {
        const { error } = await (admin as any)
          .from("content_packages")
          .delete()
          .eq("created_by", user.id)
          .eq("is_saved", false);
        if (error) throw error;
        break;
      }
      case "feedback": {
        const { error } = await (admin as any)
          .from("idea_feedback")
          .delete()
          .eq("user_id", user.id);
        if (error) throw error;
        break;
      }
      case "scheduled": {
        const { error } = await (admin as any)
          .from("content_packages")
          .delete()
          .eq("created_by", user.id)
          .eq("is_saved", true);
        if (error) throw error;
        break;
      }
      case "all": {
        const results = await Promise.all([
          (admin as any).from("content_packages").delete().eq("created_by", user.id),
          (admin as any).from("idea_feedback").delete().eq("user_id", user.id),
        ]);
        for (const r of results) {
          if (r.error) throw r.error;
        }
        break;
      }
      default:
        return NextResponse.json({ status: "error", message: "Ação inválida" }, { status: 400 });
    }

    return NextResponse.json({ status: "success", message: "Dados apagados com sucesso" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[API] Erro ao limpar dados:", message);
    return NextResponse.json({ status: "error", message: "Erro ao limpar dados", detail: message }, { status: 500 });
  }
}
