import { NextResponse } from "next/server";

/**
 * GET /api/cron/trend-analysis
 *
 * Executado pelo Vercel Cron Job todas as segundas às 08:00 UTC.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.VERCEL_CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    console.warn("[Cron] Trend analysis executado com sucesso");

    return NextResponse.json({
      status: "success",
      message: "Cron executado. Implementação pendente.",
    });
  } catch (error) {
    console.error("[Cron] Erro no trend analysis:", error);
    return NextResponse.json(
      { status: "error", message: "Erro interno" },
      { status: 500 },
    );
  }
}
