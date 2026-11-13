import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { WEEKDAYS } from "@/lib/types";

type ScheduleItem = {
  id: string;
  class_name: string;
  weekday: number;
  lesson_number: number;
  subject: string;
  room: string | null;
  room2: string | null;
  t1: { full_name: string } | null;
  t2: { full_name: string } | null;
};

export default async function ScheduleBlock({ sinf }: { sinf?: string }) {
  const { data: all } = await supabase
    .from("schedule")
    .select("class_name");

  const classes = Array.from(new Set((all ?? []).map((r) => r.class_name))).sort(
    (a, b) => a.localeCompare(b, "uz", { numeric: true })
  );

  const selected = sinf && classes.includes(sinf) ? sinf : classes[0];

  let rows: ScheduleItem[] = [];
  if (selected) {
    const { data, error } = await supabase
      .from("schedule")
      .select(
        "id, class_name, weekday, lesson_number, subject, room, room2, t1:teachers!teacher_id(full_name), t2:teachers!teacher2_id(full_name)"
      )
      .eq("class_name", selected)
      .order("lesson_number");
    if (error) console.error("Dars jadvali xatosi:", error.message);
    rows = (data ?? []) as unknown as ScheduleItem[];
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
                      // O'qituvchi va uning xonasi ketma-ket: avval 1-, keyin 2-o'qituvchi
                      const people = cell
                        ? [
                            { name: cell.t1?.full_name, room: cell.room },
                            { name: cell.t2?.full_name, room: cell.room2 },
                          ].filter((p) => p.name || p.room)
                        : [];
                      return (
                        <td key={di} className="px-3 py-3 text-center align-top">
                          {cell ? (
                            <>
                              <div className="font-bold">{cell.subject}</div>
                              {people.map((p, i) => (
                                <div key={i} className="text-xs text-slate-500">
                                  {p.name}
                                  {p.room ? `${p.name ? " · " : ""}${p.room}-xona` : ""}
                                </div>
                              ))}
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