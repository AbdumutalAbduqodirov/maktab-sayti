"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { removeImageByUrl } from "@/lib/storage";

type Row = {
  id: string;
  full_name: string;
  subject: string;
  position: string | null;
  photo_url: string | null;
  sort_order: number;
};

export default function AdminTeachersList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("teachers")
      .select("id, full_name, subject, position, photo_url, sort_order")
      .order("sort_order", { ascending: true })
      .order("full_name", { ascending: true });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(r: Row) {
    if (!confirm(`"${r.full_name}" o'qituvchisini o'chirasizmi?`)) return;

    const { error } = await supabase.from("teachers").delete().eq("id", r.id);
    if (error) {
      alert("Xatolik: " + error.message);
      return;
    }

    await removeImageByUrl(r.photo_url);
    setRows((prev) => prev.filter((x) => x.id !== r.id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">O'qituvchilar</h1>
        <Link
          href="/admin/teachers/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Yangi o'qituvchi
        </Link>
      </div>

      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-gray-500 shadow-sm">
          Hozircha o'qituvchi yo'q.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm"
            >
              {r.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
                  Rasm yo'q
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{r.full_name}</div>
                <div className="text-sm text-gray-500">
                  {r.subject}
                  {r.position ? ` · ${r.position}` : ""}
                </div>
              </div>
              <Link
                href={`/admin/teachers/${r.id}`}
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