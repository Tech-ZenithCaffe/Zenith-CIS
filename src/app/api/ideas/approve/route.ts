import { NextResponse } from "next/server";
import { PackagerAgent } from "@/agents/packager/packager-agent";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Não autenticado" },
        { status: 401 },
      );
    }

    const admin = createAdminClient();
    const { data: idea, error: fetchError } = await (admin as any)
      .from("content_packages")
      .select("*")
      .eq("id", ideaId)
      .single();

    if (fetchError || !idea) {
      return NextResponse.json(
        { status: "error", message: "Ideia não encontrada" },
        { status: 404 },
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        };

        try {
          send("progress", { step: "copywriting", status: "started" });

          const agent = new PackagerAgent();
          const output = await agent.execute({
            title: idea.idea_title,
            conceptDescription: idea.idea_description,
            format: idea.format,
            businessGoal: idea.business_goal,
            market: idea.market,
            mood: idea.mood ?? "",
            targetAudience: idea.target_audience ?? "",
          });

          send("progress", {
            step: "copywriting",
            data: { scriptFlow: output.scriptFlow, captions: output.captions },
          });

          send("progress", {
            step: "prompting",
            data: { visualPrompts: output.visualPrompts },
          });

          send("progress", {
            step: "growth",
            data: { growthTips: output.growthTips },
          });

          const { error: updateError } = await (admin as any)
            .from("content_packages")
            .update({
              is_saved: true,
              script_flow: output.scriptFlow,
              captions: output.captions,
              visual_prompts: output.visualPrompts,
              growth_tips: output.growthTips,
              updated_at: new Date().toISOString(),
            })
            .eq("id", ideaId);

          if (updateError) {
            send("error", { message: "Erro ao guardar pacote" });
            return;
          }

          send("complete", { packageId: ideaId });
        } catch (error) {
          console.error("[API] Erro no PackagerAgent:", error);
          send("error", { message: "Erro ao gerar pacote de conteúdo" });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[API] Erro ao aprovar ideia:", error);
    return NextResponse.json(
      { status: "error", message: "Erro interno" },
      { status: 500 },
    );
  }
}
