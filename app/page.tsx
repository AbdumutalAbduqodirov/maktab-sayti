import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { News, formatDate } from "@/lib/types";

export const revalidate = 60;

export default async function Home() {
  const [news, teachers, achievements] = await Promise.all([
    supabase
      .from("news")
      .select("id, title, slug, summary, cover_url, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3),
    supabase.from("teachers").select("*", { count: "exact", head: true }),
    supabase.from("achievements").select("*", { count: "exact", head: true }),
  ]);

  const latest = (news.data ?? []) as News[];

  const stats = [
    { label: "O'qituvchilar", value: teachers.count ?? 0 },
    { label: "Yutuqlar", value: achievements.count ?? 0 },
  ];

  return (
    <>
      <section className="bg-gradient-to-br from-blue-800 to-blue-600 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-4xl font-bold md:text-5xl">
            Maktabimiz web saytiga xush kelibsiz
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Yangiliklar, o'qituvchilar, o'quvchilar yutuqlari va dars jadvali bir joyda.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/maktab-haqida#jadval" className="rounded-lg bg-white px-5 py-3 font-semibold text-blue-800 hover:bg-blue-50">
              Dars jadvali
            </Link>
            <Link href="/yutuqlar" className="rounded-lg border border-white/60 px-5 py-3 font-semibold hover:bg-white/10">
              Yutuqlarimiz
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="text-4xl font-bold text-blue-700">{s.value}</div>
              <div className="mt-1 text-slate-600">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-blue-900">So'nggi yangiliklar</h2>
          <Link href="/yangiliklar" className="text-sm font-medium text-blue-700 hover:underline">
            Hammasi →
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">
            Hozircha yangiliklar yo'q.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {latest.map((n) => (
              <NewsCard key={n.id} n={n} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function NewsCard({ n }: { n: News }) {
  return (
    <Link
      href={`/yangiliklar/${n.slug}`}
      className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
    >
      {n.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={n.cover_url} alt={n.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-blue-100 text-blue-400">
          Rasm yo'q
        </div>
      )}
      <div className="p-4">
        <div className="text-xs text-slate-500">{formatDate(n.published_at)}</div>
        <h3 className="mt-1 font-semibold text-blue-900">{n.title}</h3>
        {n.summary && (
          <p className="mt-2 line-clamp-3 text-sm text-slate-600">{n.summary}</p>
        )}
      </div>
    </Link>
  );
}