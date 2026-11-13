import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";
import { Achievement, LEVELS } from "@/lib/types";

export default async function Yutuqlar({
  searchParams,
}: {
  searchParams: Promise<{ yil?: string; fan?: string; daraja?: string }>;
}) {
  const { yil, fan, daraja } = await searchParams;

  const { data: meta } = await supabase.from("achievements").select("year, subject");
  const years = Array.from(new Set((meta ?? []).map((m) => m.year))).sort((a, b) => b - a);
  const subjects = Array.from(new Set((meta ?? []).map((m) => m.subject))).sort();

  let q = supabase
    .from("achievements")
    .select("*, teachers(full_name)")
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });
  if (yil) q = q.eq("year", Number(yil));
  if (fan) q = q.eq("subject", fan);
  if (daraja) q = q.eq("level", daraja);

  const { data } = await q;
  const list = (data ?? []) as unknown as Achievement[];

  const select = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <>
      <PageHeader title="Yutuqlar" subtitle="O'quvchilarimiz va o'qituvchilarimizning muvaffaqiyatlari." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Yil</span>
            <select name="yil" defaultValue={yil ?? ""} className={select}>
              <option value="">Hammasi</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Fan</span>
            <select name="fan" defaultValue={fan ?? ""} className={select}>
              <option value="">Hammasi</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-600">Daraja</span>
            <select name="daraja" defaultValue={daraja ?? ""} className={select}>
              <option value="">Hammasi</option>
              {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
            Qidirish
          </button>
          <Link href="/yutuqlar" className="px-2 py-2 text-sm text-slate-600 hover:underline">
            Tozalash
          </Link>
        </form>

        {list.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">Yutuqlar topilmadi.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {list.map((a) => (
              <div key={a.id} className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
                {a.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image_url} alt={a.title} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
                )}
                <div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800">{a.year}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">{a.subject}</span>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">
                      {LEVELS[a.level] ?? a.level}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold text-blue-900">{a.title}</h3>
                  {a.student_name && (
                    <div className="text-sm text-slate-700">
                      {a.student_name}{a.place ? ` · ${a.place}` : ""}
                    </div>
                  )}
                  {a.teachers?.full_name && (
                    <div className="text-xs text-slate-500">Ustoz: {a.teachers.full_name}</div>
                  )}
                  {a.description && <p className="mt-1 text-sm text-slate-600">{a.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}