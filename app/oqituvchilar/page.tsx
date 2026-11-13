import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";
import { Teacher } from "@/lib/types";

export default async function Oqituvchilar({
  searchParams,
}: {
  searchParams: Promise<{ fan?: string }>;
}) {
  const { fan } = await searchParams;

  const { data: all } = await supabase.from("teachers").select("subject");
  const subjects = Array.from(new Set((all ?? []).map((t) => t.subject))).sort();

  let q = supabase.from("teachers").select("*").order("sort_order").order("full_name");
  if (fan) q = q.eq("subject", fan);
  const { data } = await q;
  const list = (data ?? []) as Teacher[];

  const chip = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium ${
      active ? "bg-blue-700 text-white" : "bg-white text-slate-700 shadow-sm hover:bg-blue-50"
    }`;

  return (
    <>
      <PageHeader title="O'qituvchilar" subtitle="Bizning pedagoglar jamoasi." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/oqituvchilar" className={chip(!fan)}>Hammasi</Link>
          {subjects.map((s) => (
            <Link key={s} href={`/oqituvchilar?fan=${encodeURIComponent(s)}`} className={chip(fan === s)}>
              {s}
            </Link>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">
            O'qituvchilar topilmadi.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((t) => (
              <div key={t.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                {t.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo_url} alt={t.full_name} className="h-60 w-full object-cover" />
                ) : (
                  <div className="flex h-60 items-center justify-center bg-blue-100 text-5xl font-bold text-blue-400">
                    {t.full_name.charAt(0)}
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-blue-900">{t.full_name}</h3>
                  <div className="text-sm text-blue-700">{t.subject}</div>
                  {t.position && <div className="mt-1 text-sm text-slate-600">{t.position}</div>}
                  {t.experience_years != null && (
                    <div className="mt-1 text-xs text-slate-500">Staj: {t.experience_years} yil</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}