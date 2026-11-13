"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Stats = {
  news: number;
  draft: number;
  teachers: number;
  achievements: number;
  classes: number;
  lessons: number;
};

const count = { count: "exact" as const, head: true };

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const [news, draft, teachers, achievements, lessons, classRows] =
        await Promise.all([
          supabase.from("news").select("id", count),
          supabase.from("news").select("id", count).eq("is_published", false),
          supabase.from("teachers").select("id", count),
          supabase.from("achievements").select("id", count),
          supabase.from("schedule").select("id", count),
          supabase.from("schedule").select("class_name"),
        ]);

      const classes = new Set(
        (classRows.data ?? []).map((r: { class_name: string }) => r.class_name)
      ).size;

      setStats({
        news: news.count ?? 0,
        draft: draft.count ?? 0,
        teachers: teachers.count ?? 0,
        achievements: achievements.count ?? 0,
        classes,
        lessons: lessons.count ?? 0,
      });
    }
    load();
  }, []);

  const v = (n?: number) => (stats ? n : "…");

  const cards = [
    {
      title: "Yangiliklar",
      value: v(stats?.news),
      note: stats && stats.draft > 0 ? `${stats.draft} tasi nashr etilmagan` : "",
      href: "/admin/news",
    },
    {
      title: "O'qituvchilar",
      value: v(stats?.teachers),
      note: "",
      href: "/admin/teachers",
    },
    {
      title: "Yutuqlar",
      value: v(stats?.achievements),
      note: "",
      href: "/admin/achievements",
    },
    {
      title: "Dars jadvali",
      value: v(stats?.classes),
      note: stats ? `sinf · ${stats.lessons} ta dars` : "",
      href: "/admin/schedule",
    },
  ];

  const actions = [
    { label: "+ Yangi yangilik", href: "/admin/news/new" },
    { label: "+ Yangi o'qituvchi", href: "/admin/teachers/new" },
    { label: "+ Yangi yutuq", href: "/admin/achievements/new" },
    { label: "Dars jadvalini tahrirlash", href: "/admin/schedule" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Xush kelibsiz!</h1>
      <p className="mt-1 text-gray-600">
        Sayt ma'lumotlarining qisqacha ko'rinishi.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="text-sm text-gray-500">{c.title}</div>
            <div className="mt-1 text-3xl font-bold text-blue-700">{c.value}</div>
            <div className="mt-1 min-h-[1.25rem] text-xs text-gray-400">
              {c.note}
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-semibold">Tezkor amallar</h2>
      <div className="flex flex-wrap gap-3">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            {a.label}
          </Link>
        ))}
        <Link
          href="/"
          target="_blank"
          className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          Saytni ko'rish ↗
        </Link>
      </div>
    </div>
  );
}