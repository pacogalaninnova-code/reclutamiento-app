"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LogOut,
  User,
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Activity,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { APP_NAME } from "@/lib/marca";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  empresas: Building2,
  vacantes: Briefcase,
  candidatos: Users,
  actividad: Activity,
  reportes: BarChart3,
  configuracion: Settings,
};

export function Header({
  nav,
  nombre,
  badge,
  cuentaHref,
}: {
  nav: { href: string; icon: string; label: string }[];
  nombre: string;
  badge?: string;
  cuentaHref?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="bg-navy px-5 h-[54px] flex items-center justify-between shadow-lg sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <div className="bg-accent rounded-lg w-7 h-7 flex items-center justify-center text-white font-bold text-sm">
          {APP_NAME.charAt(0)}
        </div>
        <span className="text-white font-extrabold text-[15px] tracking-tight">
          {APP_NAME}
        </span>
        {badge && (
          <span className="text-[10px] ml-0.5 px-2.5 py-1 rounded-full font-bold text-highlight bg-highlight/15">
            {badge}
          </span>
        )}
      </div>
      <nav className="flex gap-0.5">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-semibold text-xs ${
                active ? "bg-accent/20 text-accent" : "text-white/60 hover:text-white/90"
              }`}
            >
              <Icon size={14} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-2.5">
        {cuentaHref ? (
          <Link
            href={cuentaHref}
            className={`flex items-center gap-1.5 text-xs ${
              pathname === cuentaHref ? "text-accent font-bold" : "text-white/50 hover:text-white/80"
            }`}
          >
            <User size={13} />
            {nombre}
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-white/50">
            <User size={13} />
            {nombre}
          </span>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 border border-border/40 text-white/80 rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer hover:bg-white/10"
        >
          <LogOut size={13} />
          Salir
        </button>
      </div>
    </header>
  );
}
