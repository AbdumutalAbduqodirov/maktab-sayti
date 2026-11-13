"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { removeImageByUrl } from "@/lib/storage";

type Row = {
  id: string | number;
  title: string;
  slug: string;
  cover_url: string | null;
  published_at: string | null;
  is_published: boolean;
};

export default function AdminNewsList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("news")
      .select("id, title, slug, cover_url, published_at, is_published")
      .order("published_at", { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(r: Row) {
    if (!confirm(`"${r.title}" yangiligini o'chirasizmi?`)) return;

    const { data: imgs } = await supabase
      .from("news_images")
      .select("image_url")
      .eq("news_id", r.id);

    await supabase.from("news_images").delete().eq("news_id", r.id);
    const { error } = await supabase.from("news").delete().eq("id", r.id);
    if (error) {
      alert("Xatolik: " + error.message);
      return;
    }

    await removeImageByUrl(r.cover_url);
    for (const im of imgs ?? []) await removeImageByUrl(im.image_url);
    setRows((prev) => prev.filter((x) => x.id !== r.id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yangiliklar</h1>
        <Link
          href="/admin/news/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Yangi yangilik
        </Link>
      </div>

      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-gray-500 shadow-sm">
          Hozircha yangilik yo'q.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm"
            >
              {r.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.cover_url} alt="" className="h-16 w-24 rounded-lg object-cover" />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                  Rasm yo'q
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{r.title}</div>
                <div className="text-sm text-gray-500">
                  {r.published_at?.slice(0, 10)} ·{" "}
                  <span className={r.is_published ? "text-green-600" : "text-orange-600"}>
                    {r.is_published ? "E'lon qilingan" : "Qoralama"}
                  </span>
                </div>
              </div>
              <Link
                href={`/admin/news/${r.id}`}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Tahrirlash
              </Link>
              <button
                onClick={() => remove(r)}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                O'chirish
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}