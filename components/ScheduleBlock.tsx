import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ScheduleRow, WEEKDAYS } from "@/lib/types";

export default async function ScheduleBlock({ sinf }: { sinf?: string }) {
  const { data: all } = await supabase
    .from("schedule")
    .select("class_name");

  const classes = Array.from(new Set((all ?? []).map((r) => r.class_name))).sort(
    (a, b) => a.localeCompare(b, "uz", { numeric: true })
  );

  const selected = sinf && classes.includes(sinf) ? sinf : classes[0];

  let rows: ScheduleRow[] = [];
  if (selected) {
    const { data } = await supabase
      .from("schedule")
      .select("id, class_name, weekday, lesson_number, subject, room, teachers(full_name)")
      .eq("class_name", selected)
      .order("lesson_number");
    rows = (data ?? []) as unknown as ScheduleRow[];
  }

  const maxLesson = rows.reduce((m, r) => Math.max(m, r.lesson_number), 0);

  return (
    <section id="jadval" className="scroll-mt-24">
      <h2 className="mb-4 text-2xl font-bold text-blue-900">Dars jadvali</h2>

      {classes.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">
          Dars jadvali hozircha kiritilmagan.
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {classes.map((c) => (
              <Link
                key={c}
                href={`/maktab-haqida?sinf=${encodeURIComponent(c)}#jadval`}
                scroll={false}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  c === selected
                    ? "bg-blue-700 text-white"
                    : "bg-white text-slate-700 shadow-sm hover:bg-blue-50"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-blue-50 text-left text-blue-900">
                  <th className="px-3 py-3">№</th>
                  {WEEKDAYS.map((d) => (
                    <th key={d} className="px-3 py-3">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxLesson }, (_, i) => i + 1).map((n) => (
                  <tr key={n} className="border-t border-slate-100">
                    <td className="px-3 py-3 font-semibold text-blue-700">{n}</td>
                    {WEEKDAYS.map((_, di) => {
                      const cell = rows.find(
                        (r) => r.weekday === di + 1 && r.lesson_number === n
                      );
                      return (
                        <td key={di} className="px-3 py-3 align-top">
                          {cell ? (
                            <>
                              <div className="font-medium">{cell.subject}</div>
                              <div className="text-xs text-slate-500">
                                {cell.teachers?.full_name}
                                {cell.room ? ` · ${cell.room}-xona` : ""}
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}