import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateSvg } from "@/lib/svg-template";

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

    const svgCode = generateSvg({
      title: idea.idea_title,
      description: idea.idea_description,
      format: idea.format,
      targetAudience: idea.target_audience,
      mood: idea.mood,
    });

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
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : `Erro desconhecido: ${JSON.stringify(error)}`;
    console.error("[generate-image] Erro:", error);
    return NextResponse.json(
      { status: "error", message },
      { status: 500 },
    );
  }
}
