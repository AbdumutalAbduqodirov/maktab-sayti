import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function NewsDetail({ params }) {
  const { slug } = await params
  const { data: item } = await supabase
    .from('news')
    .select('*, news_images(image_url)')
    .eq('slug', slug)
    .single()

  if (!item) notFound()

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/news" className="text-blue-600 text-sm">← Barcha yangiliklar</Link>
      <h1 className="text-3xl font-bold mt-4">{item.title}</h1>
      <p className="text-sm text-gray-500 mt-2">{formatDate(item.published_at)}</p>

      {item.content && <div className="mt-6 whitespace-pre-line leading-relaxed">{item.content}</div>}

      {item.news_images?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
          {item.news_images.map((img, i) => (
            <img key={i} src={img.image_url} alt="" className="w-full h-40 object-cover rounded-lg" />
          ))}
        </div>
      )}
    </article>
  )
}