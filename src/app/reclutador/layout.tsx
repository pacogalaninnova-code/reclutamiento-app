import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";

const NAV = [
  { href: "/reclutador/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/reclutador/empresas", icon: "🏢", label: "Empresas" },
  { href: "/reclutador/vacantes", icon: "📋", label: "Vacantes" },
  { href: "/reclutador/candidatos", icon: "👥", label: "Candidatos" },
  { href: "/reclutador/reportes", icon: "💰", label: "Reportes" },
  { href: "/reclutador/configuracion", icon: "⚙️", label: "Config." },
];

export default async function ReclutadorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "RECLUTADOR"].includes(session.user.rol)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header nav={NAV} nombre={session.user.name ?? ""} badge="Chiapas" />
      <main className="max-w-[1200px] mx-auto">{children}</main>
    </div>
  );
}
