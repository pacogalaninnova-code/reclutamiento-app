"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export function Header({
  nav,
  nombre,
  badge,
}: {
  nav: { href: string; icon: string; label: string }[];
  nombre: string;
  badge?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="bg-navy px-5 h-[54px] flex items-center justify-between shadow-lg sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <div className="bg-coral rounded-lg w-7 h-7 flex items-center justify-center text-sm">
          ⚡
        </div>
        <span className="text-white font-extrabold text-[15px]">
          Talento<span className="text-gold">Temp</span>
        </span>
        {badge && (
          <span className="text-[10px] ml-0.5 px-2.5 py-1 rounded-full font-bold text-gold bg-gold/15">
            {badge}
          </span>
        )}
      </div>
      <nav className="flex gap-0.5">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-2.5 py-1.5 font-semibold text-xs ${
                active ? "bg-coral/20 text-coral" : "text-white/60 hover:text-white/90"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-2.5">
        <span className="text-xs text-white/50">👤 {nombre}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="border border-border/40 text-white/80 rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer hover:bg-white/10"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
