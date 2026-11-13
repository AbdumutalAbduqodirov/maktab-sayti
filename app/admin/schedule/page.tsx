"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lesson = {
  id: string;
  class_name: string;
  weekday: number;
  lesson_number: number;
  subject: string;
  teacher_id: string | null;
  teacher2_id: string | null;
  room: string | null;
  room2: string | null;
  start_time: string | null;
  end_time: string | null;
};

type Teacher = { id: string; full_name: string };

type Editing = {
  weekday: number;
  lesson_number: number;
  existing: Lesson | null;
};

const DAYS = [
  { n: 1, label: "Dushanba" },
  { n: 2, label: "Seshanba" },
  { n: 3, label: "Chorshanba" },
  { n: 4, label: "Payshanba" },
  { n: 5, label: "Juma" },
  { n: 6, label: "Shanba" },
];
const LESSON_COUNT = 8;

const hhmm = (t: string | null) => (t ? t.slice(0, 5) : "");

export default function AdminSchedulePage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [newClass, setNewClass] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Editing | null>(null);

  // modal maydonlari
  const [subject, setSubject] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teacher2Id, setTeacher2Id] = useState("");
  const [room, setRoom] = useState("");
  const [room2, setRoom2] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [saving, setSaving] = useState(false);

  const teacherName = useMemo(() => {
    const m = new Map<string, string>();
    teachers.forEach((t) => m.set(t.id, t.full_name));
    return m;
  }, [teachers]);

  const loadClasses = useCallback(async (select?: string) => {
    const { data, error } = await supabase.from("schedule").select("class_name");
    if (error) {
      alert("Xato: " + error.message);
      return;
    }
    const list = Array.from(
      new Set((data || []).map((r: { class_name: string }) => r.class_name))
    ).sort((a, b) => a.localeCompare(b, "uz", { numeric: true }));
    setClasses((prev) => {
      const merged = new Set([...list, ...(select ? [select] : [])]);
      // hali dars qo'shilmagan, lekin qo'lda qo'shilgan sinflar saqlanib qoladi
      prev.forEach((c) => merged.has(c) || (c === select && merged.add(c)));
      return Array.from(merged).sort((a, b) =>
        a.localeCompare(b, "uz", { numeric: true })
      );
    });
    setCurrent((cur) => select || cur || list[0] || "");
    setLoading(false);
  }, []);

  const loadLessons = useCallback(async (cls: string) => {
    if (!cls) {
      setLessons([]);
      return;
    }
    const { data, error } = await supabase
      .from("schedule")
      .select("*")
      .eq("class_name", cls);
    if (error) return alert("Xato: " + error.message);
    setLessons((data as Lesson[]) || []);
  }, []);

  useEffect(() => {
    loadClasses();
    supabase
      .from("teachers")
      .select("id, full_name")
      .order("full_name")
      .then(({ data }) => setTeachers((data as Teacher[]) || []));
  }, [loadClasses]);

  useEffect(() => {
    loadLessons(current);
  }, [current, loadLessons]);

  function cellOf(weekday: number, n: number) {
    return lessons.find((l) => l.weekday === weekday && l.lesson_number === n) || null;
  }

  function openCell(weekday: number, n: number) {
    const existing = cellOf(weekday, n);
    setEditing({ weekday, lesson_number: n, existing });
    setSubject(existing?.subject ?? "");
    setTeacherId(existing?.teacher_id ?? "");
    setTeacher2Id(existing?.teacher2_id ?? "");
    setRoom(existing?.room ?? "");
    setRoom2(existing?.room2 ?? "");
    setStart(hhmm(existing?.start_time ?? null));
    setEnd(hhmm(existing?.end_time ?? null));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !current) return;
    if (teacher2Id && !teacherId) {
      return alert("Avval 1-o'qituvchini tanlang.");
    }
    if (teacherId && teacherId === teacher2Id) {
      return alert("Ikkala o'qituvchi bir xil bo'lishi mumkin emas.");
    }
    setSaving(true);
    const payload = {
      class_name: current,
      weekday: editing.weekday,
      lesson_number: editing.lesson_number,
      subject: subject.trim(),
      teacher_id: teacherId || null,
      teacher2_id: teacher2Id || null,
      room: room.trim() || null,
      // 2-o'qituvchi tanlanmagan bo'lsa, uning xonasi ham saqlanmaydi
      room2: teacher2Id ? room2.trim() || null : null,
      start_time: start || null,
      end_time: end || null,
    };
    const { error } = editing.existing
      ? await supabase.from("schedule").update(payload).eq("id", editing.existing.id)
      : await supabase.from("schedule").insert(payload);
    setSaving(false);
    if (error) return alert("Xato: " + error.message);
    setEditing(null);
    loadLessons(current);
  }

  async function removeLesson() {
    if (!editing?.existing) return;
    if (!confirm("Bu darsni o'chirasizmi?")) return;
    const { error } = await supabase
      .from("schedule")
      .delete()
      .eq("id", editing.existing.id);
    if (error) return alert("Xato: " + error.message);
    setEditing(null);
    loadLessons(current);
  }

  function addClass() {
    const name = newClass.trim();
    if (!name) return;
    setClasses((prev) =>
      prev.includes(name)
        ? prev
        : [...prev, name].sort((a, b) => a.localeCompare(b, "uz", { numeric: true }))
    );
    setCurrent(name);
    setNewClass("");
  }

  async function removeClass() {
    if (!current) return;
    if (!confirm(`"${current}" sinfining butun jadvalini o'chirasizmi?`)) return;
    const { error } = await supabase.from("schedule").delete().eq("class_name", current);
    if (error) return alert("Xato: " + error.message);
    const rest = classes.filter((c) => c !== current);
    setClasses(rest);
    setCurrent(rest[0] || "");
  }

  const input = "w-full rounded-lg border px-3 py-2";
  const label = "mb-1 block text-sm font-medium";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dars jadvali</h1>

      {/* Sinf tanlash */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className={label}>Sinf</label>
          <select
            className="rounded-lg border px-3 py-2"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          >
            {classes.length === 0 && <option value="">— sinf yo'q —</option>}
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <div>
            <label className={label}>Yangi sinf</label>
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="masalan: 6-B"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addClass())}
            />
          </div>
          <button
            type="button"
            onClick={addClass}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            + Qo'shish
          </button>
        </div>

        {current && (
          <button
            type="button"
            onClick={removeClass}
            className="ml-auto rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600"
          >
            Sinfni o'chirish
          </button>
        )}
      </div>

      {loading && <p>Yuklanmoqda...</p>}
      {!loading && !current && (
        <p className="text-gray-500">Avval sinf qo'shing (masalan, 5-A).</p>
      )}

      {/* Jadval */}
      {current && (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-16 border p-2">Dars</th>
                {DAYS.map((d) => (
                  <th key={d.n} className="border p-2">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: LESSON_COUNT }, (_, i) => i + 1).map((n) => (
                <tr key={n}>
                  <td className="border p-2 text-center font-semibold">{n}</td>
                  {DAYS.map((d) => {
                    const l = cellOf(d.n, n);
                    const people = l
                      ? [
                          { id: l.teacher_id, room: l.room },
                          { id: l.teacher2_id, room: l.room2 },
                        ].filter((p) => p.id)
                      : [];
                    return (
                      <td
                        key={d.n}
                        onClick={() => openCell(d.n, n)}
                        className="h-20 cursor-pointer border p-2 text-center align-top hover:bg-blue-50"
                      >
                        {l ? (
                          <div>
                            <div className="font-bold">{l.subject}</div>
                            {people.map((p) => (
                              <div key={p.id} className="text-gray-600">
                                {teacherName.get(p.id as string)}
                                {p.room && (
                                  <span className="text-xs text-gray-400">
                                    {" "}
                                    · {p.room}-xona
                                  </span>
                                )}
                              </div>
                            ))}
                            {/* O'qituvchi tanlanmagan bo'lsa ham xona ko'rinsin */}
                            {people.length === 0 && l.room && (
                              <div className="text-xs text-gray-400">
                                {l.room}-xona
                              </div>
                            )}
                            {l.start_time && (
                              <div className="text-xs text-gray-400">
                                {hhmm(l.start_time)}
                                {l.end_time ? "–" + hhmm(l.end_time) : ""}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">+</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dars tahrirlash oynasi */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={save}
            className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold">
              {current} · {DAYS.find((d) => d.n === editing.weekday)?.label} ·{" "}
              {editing.lesson_number}-dars
            </h2>

            <div>
              <label className={label}>Fan *</label>
              <input
                className={input}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* 1-o'qituvchi va uning xonasi */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={label}>1-o'qituvchi</label>
                <select
                  className={input}
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  <option value="">— tanlanmagan —</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>1-xona</label>
                <input
                  className={input}
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>
            </div>

            {/* 2-o'qituvchi va uning xonasi */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={label}>2-o'qituvchi (dars bo'linsa)</label>
                <select
                  className={input}
                  value={teacher2Id}
                  onChange={(e) => setTeacher2Id(e.target.value)}
                >
                  <option value="">— yo'q —</option>
                  {teachers
                    .filter((t) => t.id !== teacherId)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className={label}>2-xona</label>
                <input
                  className={input}
                  value={room2}
                  onChange={(e) => setRoom2(e.target.value)}
                  disabled={!teacher2Id}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Boshlanishi</label>
                <input
                  type="time"
                  className={input}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Tugashi</label>
                <input
                  type="time"
                  className={input}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
              >
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border px-5 py-2"
              >
                Bekor qilish
              </button>
              {editing.existing && (
                <button
                  type="button"
                  onClick={removeLesson}
                  className="ml-auto rounded-lg border border-red-300 px-4 py-2 text-red-600"
                >
                  O'chirish
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}