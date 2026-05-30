import { NextResponse } from "next/server";

/**
 * POST /api/ideas/approve
 *
 * Aprova uma ideia e inicia o pipeline de geração.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ideaId = body.idea_id as string | undefined;

    if (!ideaId) {
      return NextResponse.json(
        { status: "error", message: "idea_id é obrigatório" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      status: "success",
      message: `Ideia ${ideaId} aprovada. Implementação pendente.`,
    });
  } catch (error) {
    console.error("[API] Erro ao aprovar ideia:", error);
    return NextResponse.json(
      { status: "error", message: "Erro interno" },
      { status: 500 },
    );
  }
}
