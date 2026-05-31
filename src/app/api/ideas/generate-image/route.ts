import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

    const formatMap: Record<string, string> = {
      stories: "Instagram Stories (vertical 9:16)",
      reels: "Instagram Reels (vertical 9:16, vídeo)",
      carousel: "Carrossel (vários slides)",
    };

    const prompt = `Generate a photorealistic image for a social media content idea with these characteristics:
- Title: ${idea.idea_title}
- Concept: ${idea.idea_description}
- Format: ${formatMap[idea.format] ?? idea.format}
- Target audience: ${idea.target_audience ?? "general"}
- Mood/theme: ${idea.mood ?? "professional"}
- Business goal: ${idea.business_goal}

Generate a high-quality, visually appealing image that represents this content idea. The image should be suitable for social media, with good lighting, composition, and professional quality. Return ONLY the image.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { status: "error", message: "GEMINI_API_KEY não configurada" },
        { status: 500 },
      );
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["Text", "Image"],
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[generate-image] Gemini error:", errText);
      return NextResponse.json(
        { status: "error", message: "Erro ao gerar imagem com IA" },
        { status: 500 },
      );
    }

    const geminiData = await geminiRes.json();

    let imageData: string | null = null;
    let mimeType = "image/png";

    for (const part of geminiData?.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        imageData = part.inlineData.data;
        mimeType = part.inlineData.mimeType ?? "image/png";
        break;
      }
    }

    if (!imageData) {
      return NextResponse.json(
        { status: "error", message: "Gemini não devolveu uma imagem" },
        { status: 500 },
      );
    }

    const buffer = Buffer.from(imageData, "base64");
    const fileName = `idea-${idea_id}.${mimeType.split("/")[1] ?? "png"}`;

    const { data: uploadData, error: uploadError } = await (admin as any).storage
      .from("idea-images")
      .upload(fileName, buffer, {
        contentType: mimeType,
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
            contentType: mimeType,
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

    const imageUrl = urlData?.publicUrl ?? `https://${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace("https://", "")}/storage/v1/object/public/idea-images/${fileName}`;

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
