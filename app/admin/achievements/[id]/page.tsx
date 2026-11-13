"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadImage, removeImageByUrl } from "@/lib/storage";

const BUCKET = "achievements";

const LEVELS = [
  { value: "maktab", label: "Maktab" },
  { value: "tuman", label: "Tuman" },
  { value: "viloyat", label: "Viloyat" },
  { value: "respublika", label: "Respublika" },
  { value: "xalqaro", label: "Xalqaro" },
];

type Teacher = { id: string; full_name: string };

export default function AdminAchievementForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [studentName, setStudentName] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("viloyat");
  const [place, setPlace] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    supabase
      .from("teachers")
      .select("id, full_name")
      .order("full_name")
      .then(({ data }) => setTeachers((data as Teacher[]) || []));

    if (!isNew) {
      supabase
        .from("achievements")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            alert("Yutuq topilmadi");
            router.push("/admin/achievements");
            return;
          }
          setTitle(data.title ?? "");
          setDescription(data.description ?? "");
          setStudentName(data.student_name ?? "");
          setYear(data.year ?? new Date().getFullYear());
          setSubject(data.subject ?? "");
          setLevel(data.level ?? "viloyat");
          setPlace(data.place ?? "");
          setTeacherId(data.teacher_id ?? "");
          setImageUrl(data.image_url ?? null);
          setLoading(false);
        });
    }
  }, [id, isNew, router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let newUrl = imageUrl;
      if (file) {
        newUrl = await uploadImage(file, BUCKET);
        if (imageUrl) await removeImageByUrl(imageUrl, BUCKET);
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        student_name: studentName.trim() || null,
        year,
        subject: subject.trim() || null,
        level,
        place: place.trim() || null,
        teacher_id: teacherId || null,
        image_url: newUrl,
      };

      const { error } = isNew
        ? await supabase.from("achievements").insert(payload)
        : await supabase.from("achievements").update(payload).eq("id", id);

      if (error) throw error;
      router.push("/admin/achievements");
      router.refresh();
    } catch (err) {
      alert("Xato: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Yuklanmoqda...</p>;

  const input = "w-full rounded-lg border px-3 py-2";
  const label = "mb-1 block text-sm font-medium";

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">
        {isNew ? "Yangi yutuq" : "Yutuqni tahrirlash"}
      </h1>

      <div>
        <label className={label}>Yutuq nomi *</label>
        <input
          className={input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={label}>Tavsif</label>
        <textarea
          className={input}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className={label}>O'quvchi ismi</label>
        <input
          className={input}
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Yil *</label>
          <input
            type="number"
            className={input}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className={label}>Fan</label>
          <input
            className={input}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Informatika"
          />
        </div>
        <div>
          <label className={label}>Daraja *</label>
          <select
            className={input}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>O'rin</label>
          <input
            className={input}
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="1-o'rin"
          />
        </div>
      </div>

      <div>
        <label className={label}>Tayyorlagan o'qituvchi</label>
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
        <label className={label}>Rasm (diplom, sertifikat yoki foto)</label>
        {imageUrl && !file && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Joriy rasm"
            className="mb-2 h-32 rounded-lg object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
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
          onClick={() => router.push("/admin/achievements")}
          className="rounded-lg border px-5 py-2"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}