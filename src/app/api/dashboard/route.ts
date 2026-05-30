import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = createAdminClient();

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [pendingRes, weeklyRes, monthlyRes] = await Promise.all([
      (admin as any)
        .from("content_packages")
        .select("id", { count: "exact", head: true })
        .eq("is_saved", false),
      (admin as any)
        .from("content_packages")
        .select("id", { count: "exact", head: true })
        .eq("is_saved", true)
        .gte("scheduled_date", startOfWeek.toISOString())
        .lte("scheduled_date", endOfWeek.toISOString()),
      (admin as any)
        .from("content_packages")
        .select("id", { count: "exact", head: true })
        .eq("is_saved", true)
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString()),
    ]);

    return NextResponse.json({
      status: "success",
      metrics: {
        pendingIdeas: pendingRes.count ?? 0,
        scheduledThisWeek: weeklyRes.count ?? 0,
        publishedThisMonth: monthlyRes.count ?? 0,
      },
    });
  } catch (error) {
    console.error("[API] Erro no dashboard:", error);
    return NextResponse.json(
      { status: "error", message: "Erro ao carregar dashboard" },
      { status: 500 },
    );
  }
}
