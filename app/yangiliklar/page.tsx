import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { NewsCard } from "@/app/page";
import { supabase } from "@/lib/supabase";
import { News } from "@/lib/types";

const PER_PAGE = 9;

export default async function Yangiliklar({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const from = (page - 1) * PER_PAGE;

  const { data, count } = await supabase
    .from("news")
    .select("id, title, slug, summary, cover_url, published_at", {
      count: "exact",
    })
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range(from, from + PER_PAGE - 1);

  const list = (data ?? []) as News[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <PageHeader title="Yangiliklar" subtitle="Maktab hayotidagi so'nggi voqealar." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="mb-6 text-sm text-slate-600">
          Jami: <b>{total}</b>
        </p>

        {list.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">
            Hozircha yangiliklar yo'q.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((n) => (
              <NewsCard key={n.id} n={n} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/yangiliklar?page=${p}`}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  p === page
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                href={`/yangiliklar?page=${page + 1}`}
                className="rounded-lg border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                Keyingi →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}