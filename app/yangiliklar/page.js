import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'
const PER_PAGE = 10

export default async function NewsPage({ searchParams }) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp?.page) || 1)
  const from = (page - 1) * PER_PAGE

  const { data: news, count } = await supabase
    .from('news')
    .select('id, title, slug, published_at', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, from + PER_PAGE - 1)

  const totalPages = Math.max(1, Math.ceil((count || 0) / PER_PAGE))

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Yangiliklar</h1>
      <p className="text-gray-600 mt-1">Maktabimizdan so'nggi xabarlar.</p>
      <p className="mt-4 text-sm">Jami: <b>{count || 0}</b></p>

      <div className="mt-4 space-y-3">
        {(news || []).map((n) => (
          <Link key={n.id} href={`/news/${n.slug}`}
            className="block bg-white border rounded-xl p-4 hover:shadow-md hover:border-blue-400 transition">
            <h2 className="font-semibold text-lg">{n.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{formatDate(n.published_at)}</p>
          </Link>
        ))}
        {(!news || news.length === 0) && <p className="text-gray-500">Hozircha yangilik yo'q.</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/news?page=${p}`}
              className={`px-3 py-1 rounded-lg border ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'}`}>
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={`/news?page=${page + 1}`} className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-100">
              Keyingi →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}