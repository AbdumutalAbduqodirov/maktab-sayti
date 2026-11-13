"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { uploadImage, removeImageByUrl } from "@/lib/storage";

type Img = { id: string | number; image_url: string; caption: string | null };

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[ʻʼ'‘’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewsForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 10));
  const [isPublished, setIsPublished] = useState(true);

  const [coverUrl, setCoverUrl] = useState("");
  const [originalCover, setOriginalCover] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [gallery, setGallery] = useState<Img[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data } = await supabase.from("news").select("*").eq("id", id).maybeSingle();
      if (!data) {
        setError("Yangilik topilmadi");
        setLoading(false);
        return;
      }
      setTitle(data.title ?? "");
      setSlug(data.slug ?? "");
      setSummary(data.summary ?? "");
      setContent(data.content ?? "");
      setPublishedAt((data.published_at ?? "").slice(0, 10));
      setIsPublished(!!data.is_published);
      setCoverUrl(data.cover_url ?? "");
      setOriginalCover(data.cover_url ?? "");

      const { data: imgs } = await supabase
        .from("news_images")
        .select("id, image_url, caption")
        .eq("news_id", id)
        .order("sort_order");
      setGallery((imgs ?? []) as Img[]);
      setLoading(false);
    })();
  }, [id, isNew]);

  async function deleteGalleryImage(g: Img) {
    if (!confirm("Bu rasmni o'chirasizmi?")) return;
    await supabase.from("news_images").delete().eq("id", g.id);
    await removeImageByUrl(g.image_url);
    setGallery((prev) => prev.filter((x) => x.id !== g.id));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Sarlavha kiritilishi shart");
    setSaving(true);
    setError("");

    try {
      let cover = coverUrl;
      if (coverFile) cover = await uploadImage(coverFile);

      const finalSlug =
        slug.trim() ||
        `${slugify(title) || "yangilik"}-${Date.now().toString(36).slice(-4)}`;

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        summary: summary.trim() || null,
        content: content.trim() || null,
        cover_url: cover || null,
        published_at: publishedAt || new Date().toISOString().slice(0, 10),
        is_published: isPublished,
      };

      let newsId: string | number = id;
      if (isNew) {
        const { data, error } = await supabase
          .from("news")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        newsId = data.id;
      } else {
        const { error } = await supabase.from("news").update(payload).eq("id", id);
        if (error) throw error;
      }

      if (originalCover && originalCover !== cover) await removeImageByUrl(originalCover);

      for (let i = 0; i < newFiles.length; i++) {
        const url = await uploadImage(newFiles[i]);
        const { error } = await supabase
          .from("news_images")
          .insert({ news_id: newsId, image_url: url, sort_order: gallery.length + i });
        if (error) throw error;
      }

      await Promise.all(
        gallery.map((g) =>
          supabase.from("news_images").update({ caption: g.caption || null }).eq("id", g.id)
        )
      );

      router.push("/admin/news");
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? "Noma'lum xatolik";
      setError(
        msg.includes("duplicate") ? "Bu slug allaqachon band, boshqasini kiriting" : msg
      );
      setSaving(false);
    }
  }

  if (loading) return <p>Yuklanmoqda...</p>;

  const coverPreview = coverFile ? URL.createObjectURL(coverFile) : coverUrl;
  const input = "w-full rounded-lg border px-3 py-2";

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isNew ? "Yangi yangilik" : "Yangilikni tahrirlash"}
        </h1>
        <Link href="/admin/news" className="text-sm text-blue-700 hover:underline">
          ← Orqaga
        </Link>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Sarlavha *</label>
        <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Slug (manzil) <span className="text-gray-400">— bo'sh qoldirsangiz o'zi yaratiladi</span>
        </label>
        <input
          className={input}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="yangi-oquv-yili-boshlandi"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Qisqa mazmun</label>
        <textarea
          className={input}
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">To'liq matn</label>
        <textarea
          className={input}
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Sana</label>
          <input
            type="date"
            className="rounded-lg border px-3 py-2"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
        </div>
        <label className="mt-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Saytda e'lon qilish
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Muqova rasmi</label>
        {coverPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreview} alt="" className="mb-2 h-40 rounded-lg object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
        />
        {coverPreview && (
          <button
            type="button"
            onClick={() => {
              setCoverFile(null);
              setCoverUrl("");
            }}
            className="ml-3 text-sm text-red-600 hover:underline"
          >
            Muqovani olib tashlash
          </button>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Galereya</label>
        {gallery.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3">
            {gallery.map((g) => (
              <div key={g.id} className="rounded-lg bg-white p-2 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.image_url} alt="" className="h-28 w-full rounded object-cover" />
                <input
                  className="mt-2 w-full rounded border px-2 py-1 text-xs"
                  placeholder="Izoh (ixtiyoriy)"
                  value={g.caption ?? ""}
                  onChange={(e) =>
                    setGallery((prev) =>
                      prev.map((x) => (x.id === g.id ? { ...x, caption: e.target.value } : x))
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => deleteGalleryImage(g)}
                  className="mt-1 text-xs text-red-600 hover:underline"
                >
                  O'chirish
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
        />
        {newFiles.length > 0 && (
          <p className="mt-1 text-sm text-gray-500">{newFiles.length} ta yangi rasm tanlandi</p>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button
        disabled={saving}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}