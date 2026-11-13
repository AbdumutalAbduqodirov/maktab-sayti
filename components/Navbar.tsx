"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/maktab-haqida", label: "Maktab haqida" },
  { href: "/yangiliklar", label: "Yangiliklar" },
  { href: "/oqituvchilar", label: "O'qituvchilar" },
  { href: "/yutuqlar", label: "Yutuqlar" },
  { href: "/aloqa", label: "Aloqa" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white">
            M
          </span>
          <span className="leading-tight">
            Ixtisoslashtirilgan
            <br />
            <span className="text-xs font-medium text-blue-600">maktabi</span>
          </span>
        </Link>

        <nav className="hidden gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(l.href)
                  ? "bg-blue-700 text-white"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg border border-blue-200 px-3 py-2 text-sm text-blue-800 md:hidden"
          aria-label="Menyu"
        >
          {open ? "Yopish" : "Menyu"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-blue-100 bg-white px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-3 text-sm font-medium ${
                isActive(l.href) ? "bg-blue-50 text-blue-800" : "text-slate-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}