import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateGeminiContent } from "@/lib/gemini/client";

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
      stories: "vertical 9:16",
      reels: "vertical 9:16",
      carousel: "horizontal 1:1 (slide thumbnail)",
    };

    const formatDesc = formatMap[idea.format as string] ?? "1:1";

    const svgPrompt = `Generate a visually stunning SVG illustration for a social media post.

Title: "${idea.idea_title}"
Description: "${idea.idea_description || ""}"
Format: ${formatDesc}
Target audience: ${idea.target_audience || "general"}
Mood: ${idea.mood || "professional"}

Requirements:
- Modern, clean, visually appealing design
- Use a beautiful color palette appropriate for the mood
- Include readable typography (title as text)
- Use shapes, gradients, icons, or illustrations
- Aspect ratio: ${formatDesc}
- Return ONLY valid SVG code inside \`\`\`svg...\`\`\` — no explanations`;

    const svgRaw = await generateGeminiContent(
      "You are a professional graphic designer specialized in social media visuals. Generate high-quality SVG images only.",
      svgPrompt,
    );

    const svgMatch = svgRaw.match(/```svg\s*([\s\S]*?)```/);
    const svgCode = svgMatch?.[1]?.trim() || svgRaw.trim();

    if (!svgCode.startsWith("<svg")) {
      throw new Error("Gemini não gerou SVG válido");
    }

    const fileName = `idea-${idea_id}.svg`;
    const { error: uploadError } = await (admin as any).storage
      .from("idea-images")
      .upload(fileName, svgCode, {
        contentType: "image/svg+xml",
        upsert: true,
      });

    if (uploadError) {
      const { data: bucketData } = await (admin as any).storage
        .getBucket("idea-images");

      if (!bucketData) {
        await (admin as any).storage.createBucket("idea-images", {
          public: true,
        });
        const { error: retryError } = await (admin as any).storage
          .from("idea-images")
          .upload(fileName, svgCode, {
            contentType: "image/svg+xml",
            upsert: true,
          });

        if (retryError) {
          throw new Error(`Upload retry failed: ${retryError.message}`);
        }
      } else {
        throw new Error(`Upload failed: ${uploadError.message}`);
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
    const message =
      error instanceof Error ? error.message : "Erro ao processar pedido";
    console.error("[generate-image] Erro:", message);
    return NextResponse.json(
      { status: "error", message },
      { status: 500 },
    );
  }
}
