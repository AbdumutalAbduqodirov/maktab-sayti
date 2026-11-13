import { supabase } from "@/lib/supabase";

const DEFAULT_BUCKET = "news";

export async function uploadImage(
  file: File,
  bucket: string = DEFAULT_BUCKET
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function removeImageByUrl(
  url?: string | null,
  bucket: string = DEFAULT_BUCKET
) {
  if (!url) return;
  const marker = `/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  await supabase.storage
    .from(bucket)
    .remove([decodeURIComponent(url.slice(i + marker.length))]);
}