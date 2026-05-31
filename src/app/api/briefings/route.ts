import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Não autenticado" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data, error } = await (admin as any)
      .from("briefings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ status: "success", briefings: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[briefings] GET error:", message);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Não autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const type = (formData.get("type") as string) || "text";
    const content = formData.get("content") as string | null;
    const file = formData.get("file") as File | null;

    if (!title?.trim()) {
      return NextResponse.json({ status: "error", message: "Título é obrigatório" }, { status: 400 });
    }

    const admin = createAdminClient();

    let fileUrl: string | null = null;
    let fileType: string | null = null;
    let fileSize: number | null = null;

    if (file && file.size > 0) {
      fileType = file.type;
      fileSize = file.size;

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${user.id}/${Date.now()}-${file.name}`;

      const { error: bucketCheck } = await (admin as any).storage.getBucket("briefing-files");
      if (!bucketCheck) {
        await (admin as any).storage.createBucket("briefing-files", { public: true });
      }

      const { error: uploadError } = await (admin as any).storage
        .from("briefing-files")
        .upload(fileName, buffer, { contentType: file.type, upsert: false });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = await (admin as any).storage
        .from("briefing-files")
        .getPublicUrl(fileName);

      fileUrl = urlData?.publicUrl ?? null;
    }

    const { data, error } = await (admin as any)
      .from("briefings")
      .insert({
        user_id: user.id,
        title: title.trim(),
        content: content || null,
        type,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ status: "success", briefing: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[briefings] POST error:", message);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ status: "error", message: "ID é obrigatório" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Não autenticado" }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: existing } = await (admin as any)
      .from("briefings")
      .select("file_url, id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ status: "error", message: "Briefing não encontrado" }, { status: 404 });
    }

    if (existing.file_url) {
      const pathMatch = existing.file_url.match(/briefing-files\/(.+)/);
      if (pathMatch) {
        await (admin as any).storage.from("briefing-files").remove([pathMatch[1]]);
      }
    }

    const { error } = await (admin as any)
      .from("briefings")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ status: "success", message: "Briefing removido" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[briefings] DELETE error:", message);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
