import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-blue-950 text-blue-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <h3 className="mb-2 text-lg font-bold text-white">
            Ixtisoslashtirilgan maktab
          </h3>
          <p className="text-sm text-blue-200">
            Bekobod shahri. Zamonaviy bilim, yuksak natija.
          </p>
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-white">Bo'limlar</h4>
          <ul className="space-y-1 text-sm">
            <li><Link href="/maktab-haqida" className="hover:text-white">Maktab haqida</Link></li>
            <li><Link href="/maktab-haqida#jadval" className="hover:text-white">Dars jadvali</Link></li>
            <li><Link href="/yangiliklar" className="hover:text-white">Yangiliklar</Link></li>
            <li><Link href="/yutuqlar" className="hover:text-white">Yutuqlar</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-white">Aloqa</h4>
          <p className="text-sm text-blue-200">
            Manzil, telefon va email keyinroq to'ldiriladi.
          </p>
        </div>
      </div>
      <div className="border-t border-blue-900 py-4 text-center text-xs text-blue-300">
        © {new Date().getFullYear()} Barcha huquqlar himoyalangan
      </div>
    </footer>
  );
}