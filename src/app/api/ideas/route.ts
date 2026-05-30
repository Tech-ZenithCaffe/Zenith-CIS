import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  try {
    return NextResponse.json({
      status: "success",
      ideas: [],
      message: "Implementacao pendente.",
    });
  } catch (error) {
    console.error("[API] Erro ao buscar ideias:", error);
    return NextResponse.json(
      { status: "error", message: "Erro interno" },
      { status: 500 },
    );
  }
}
