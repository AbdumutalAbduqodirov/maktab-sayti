"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { uploadImage, removeImageByUrl } from "@/lib/storage";

export default function TeacherForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [subject, setSubject] = useState("");
  const [position, setPosition] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const [photoUrl, setPhotoUrl] = useState("");
  const [originalPhoto, setOriginalPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data: all } = await supabase.from("teachers").select("subject");
      setSubjects(
        Array.from(new Set((all ?? []).map((r) => r.subject as string).filter(Boolean))).sort()
      );

      if (isNew) return;
      const { data } = await supabase.from("teachers").select("*").eq("id", id).maybeSingle();
      if (!data) {
        setError("O'qituvchi topilmadi");
        setLoading(false);
        return;
      }
      setFullName(data.full_name ?? "");
      setSubject(data.subject ?? "");
      setPosition(data.position ?? "");
      setExperience(data.experience_years != null ? String(data.experience_years) : "");
      setBio(data.bio ?? "");
      setEmail(data.email ?? "");
      setPhone(data.phone ?? "");
      setSortOrder(String(data.sort_order ?? 0));
      setPhotoUrl(data.photo_url ?? "");
      setOriginalPhoto(data.photo_url ?? "");
      setLoading(false);
    })();
  }, [id, isNew]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return setError("F.I.Sh. kiritilishi shart");
    if (!subject.trim()) return setError("Fan kiritilishi shart");

    const exp = experience.trim() === "" ? null : Number(experience);
    if (exp !== null && (!Number.isInteger(exp) || exp < 0)) {
      return setError("Tajriba musbat butun son bo'lishi kerak");
    }

    setSaving(true);
    setError("");

    try {
      let photo = photoUrl;
      if (photoFile) photo = await uploadImage(photoFile);

      const payload = {
        full_name: fullName.trim(),
        subject: subject.trim(),
        position: position.trim() || null,
        experience_years: exp,
        bio: bio.trim() || null,
        photo_url: photo || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        sort_order: Number(sortOrder) || 0,
      };

      if (isNew) {
        const { error } = await supabase.from("teachers").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("teachers").update(payload).eq("id", id);
        if (error) throw error;
      }

      if (originalPhoto && originalPhoto !== photo) await removeImageByUrl(originalPhoto);

      router.push("/admin/teachers");
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Noma'lum xatolik");
      setSaving(false);
    }
  }

  if (loading) return <p>Yuklanmoqda...</p>;

  const photoPreview = photoFile ? URL.createObjectURL(photoFile) : photoUrl;
  const input = "w-full rounded-lg border px-3 py-2";

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isNew ? "Yangi o'qituvchi" : "O'qituvchini tahrirlash"}
        </h1>
        <Link href="/admin/teachers" className="text-sm text-blue-700 hover:underline">
          ← Orqaga
        </Link>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">F.I.Sh. *</label>
        <input className={input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Fan *</label>
          <input
            className={input}
            list="subjects-list"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Informatika"
          />
          <datalist id="subjects-list">
            {subjects.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Lavozimi</label>
          <input
            className={input}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Oliy toifali o'qituvchi"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Tajriba (yil)</label>
          <input
            type="number"
            min={0}
            className={input}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Tartib raqami <span className="text-gray-400">— kichigi birinchi chiqadi</span>
          </label>
          <input
            type="number"
            className={input}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            className={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Telefon</label>
          <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Qisqa tarjimai hol</label>
        <textarea
          className={input}
          rows={6}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Rasm</label>
        {photoPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoPreview} alt="" className="mb-2 h-32 w-32 rounded-full object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
        />
        {photoPreview && (
          <button
            type="button"
            onClick={() => {
              setPhotoFile(null);
              setPhotoUrl("");
            }}
            className="ml-3 text-sm text-red-600 hover:underline"
          >
            Rasmni olib tashlash
          </button>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button
        disabled={saving}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}