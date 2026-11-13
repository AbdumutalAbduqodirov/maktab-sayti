import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { News, NewsImage, formatDate } from "@/lib/types";

export const revalidate = 60;

export default async function YangilikBatafsil({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) notFound();
  const n = data as News;

  const { data: imgs } = await supabase
    .from("news_images")
    .select("id, image_url, caption")
    .eq("news_id", n.id)
    .order("sort_order");
  const gallery = (imgs ?? []) as NewsImage[];

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/yangiliklar" className="text-sm text-blue-700 hover:underline">
        ← Barcha yangiliklar
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-blue-900">{n.title}</h1>
      <div className="mt-1 text-sm text-slate-500">{formatDate(n.published_at)}</div>

      {n.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={n.cover_url} alt={n.title} className="mt-6 w-full rounded-xl object-cover" />
      )}

      <div className="mt-6 whitespace-pre-line leading-relaxed text-slate-700">
        {n.content}
      </div>

      {gallery.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold text-blue-900">Galereya</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {gallery.map((g) => (
              <figure key={g.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.image_url} alt={g.caption ?? ""} className="h-40 w-full object-cover" />
                {g.caption && (
                  <figcaption className="p-2 text-xs text-slate-600">{g.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}