'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const links = [
  { href: '/admin', label: 'Bosh panel' },
  { href: '/admin/news', label: 'Yangiliklar' },
  { href: '/admin/teachers', label: "O'qituvchilar" },
  { href: '/admin/achievements', label: 'Yutuqlar' },
  { href: '/admin/schedule', label: 'Dars jadvali' },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const isLogin = pathname === '/admin/login'

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session && !isLogin) router.replace('/admin/login')
      else if (data.session && isLogin) router.replace('/admin')
      else setReady(true)
    })
  }, [pathname])

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (!ready) return <p className="p-6">Yuklanmoqda...</p>
  if (isLogin) return children

  return (
    <div className="min-h-screen md:flex">
      <aside className="md:w-56 bg-gray-900 text-white p-4 space-y-2">
        <h2 className="font-bold mb-4">Admin panel</h2>
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={`block px-3 py-2 rounded-lg ${pathname === l.href ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            {l.label}
          </Link>
        ))}
        <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-red-300 hover:bg-gray-800">
          Chiqish
        </button>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  )
}