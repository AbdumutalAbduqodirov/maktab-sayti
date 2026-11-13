"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { removeImageByUrl } from "@/lib/storage";

type Row = {
  id: string;
  title: string;
  student_name: string | null;
  year: number | null;
  subject: string | null;
  level: string | null;
  place: string | null;
  image_url: string | null;
  teachers: { full_name: string } | null;
};

export default function AdminAchievementsList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data, error } = await supabase
      .from("achievements")
      .select("*, teachers(full_name)")
      .order("year", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) alert("Xato: " + error.message);
    setRows((data as unknown as Row[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(r: Row) {
    if (!confirm(`"${r.title}" yutug'ini o'chirasizmi?`)) return;
    const { error } = await supabase.from("achievements").delete().eq("id", r.id);
    if (error) return alert("Xato: " + error.message);
    await removeImageByUrl(r.image_url, "achievements");
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yutuqlar</h1>
        <Link
          href="/admin/achievements/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          + Yangi yutuq
        </Link>
      </div>

      {loading && <p>Yuklanmoqda...</p>}
      {!loading && rows.length === 0 && <p>Hozircha yutuqlar yo'q.</p>}

      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
          >
            {r.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.image_url}
                alt={r.title}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                🏆
              </div>
            )}
            <div className="flex-1">
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-gray-500">
                {[r.student_name, r.subject, r.level, r.place, r.year]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
              {r.teachers?.full_name && (
                <div className="text-sm text-gray-400">
                  O'qituvchi: {r.teachers.full_name}
                </div>
              )}
            </div>
            <Link
              href={`/admin/achievements/${r.id}`}
              className="rounded-lg border px-3 py-1.5 text-sm"
            >
              Tahrirlash
            </Link>
            <button
              onClick={() => remove(r)}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600"
            >
              O'chirish
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}