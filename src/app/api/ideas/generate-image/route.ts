import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const HF_API_URL =
  "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";

export async function POST(request: Request) {
  try {
    const { idea_id } = await request.json();

    if (!idea_id) {
      return NextResponse.json(
        { status: "error", message: "ID da ideia é obrigatório" },
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
      .eq("id", idea_id)
      .single();

    if (fetchError || !idea) {
      return NextResponse.json(
        { status: "error", message: "Ideia não encontrada" },
        { status: 404 },
      );
    }

    if (idea.image_url) {
      return NextResponse.json({ status: "success", image_url: idea.image_url });
    }

    const hfToken = process.env.HUGGINGFACE_API_KEY;
    if (!hfToken) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "HUGGINGFACE_API_KEY não configurada. Cria uma conta gratuita em huggingface.co e gera um token em huggingface.co/settings/tokens.",
        },
        { status: 500 },
      );
    }

    const formatMap: Record<string, string> = {
      stories: "Instagram Stories, vertical 9:16",
      reels: "Instagram Reels, vertical 9:16",
      carousel: "Carrossel Instagram, múltiplos slides",
    };

    const prompt = `Social media content visual: ${idea.idea_title}. ${idea.idea_description}. Format: ${formatMap[idea.format] ?? idea.format}. Target: ${idea.target_audience ?? "general audience"}. Mood: ${idea.mood ?? "professional"}. Photorealistic, high quality, well composed.`;

    const hfRes = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      console.error("[generate-image] Hugging Face error:", hfRes.status, errText);
      return NextResponse.json(
        { status: "error", message: "Erro ao gerar imagem com IA" },
        { status: 500 },
      );
    }

    const arrayBuffer = await hfRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `idea-${idea_id}.png`;

    const { data: uploadData, error: uploadError } = await (admin as any).storage
      .from("idea-images")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      const { data: bucketData } = await (admin as any).storage
        .getBucket("idea-images");

      if (!bucketData) {
        await (admin as any).storage.createBucket("idea-images", {
          public: true,
        });
        const { data: retryData, error: retryError } = await (admin as any).storage
          .from("idea-images")
          .upload(fileName, buffer, {
            contentType: "image/png",
            upsert: true,
          });

        if (retryError) {
          console.error("[generate-image] Upload retry error:", retryError);
          return NextResponse.json(
            { status: "error", message: "Erro ao guardar imagem" },
            { status: 500 },
          );
        }
      } else {
        console.error("[generate-image] Upload error:", uploadError);
        return NextResponse.json(
          { status: "error", message: "Erro ao guardar imagem" },
          { status: 500 },
        );
      }
    }

    const { data: urlData } = await (admin as any).storage
      .from("idea-images")
      .getPublicUrl(fileName);

    const imageUrl =
      urlData?.publicUrl ??
      `https://${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace("https://", "")}/storage/v1/object/public/idea-images/${fileName}`;

    await (admin as any)
      .from("content_packages")
      .update({ image_url: imageUrl })
      .eq("id", idea_id);

    return NextResponse.json({ status: "success", image_url: imageUrl });
  } catch (error) {
    console.error("[generate-image] Erro:", error);
    return NextResponse.json(
      { status: "error", message: "Erro ao processar pedido" },
      { status: 500 },
    );
  }
}
