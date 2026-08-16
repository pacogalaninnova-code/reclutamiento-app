import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";

const NAV = [
  { href: "/reclutador/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/reclutador/empresas", icon: "empresas", label: "Empresas" },
  { href: "/reclutador/vacantes", icon: "vacantes", label: "Vacantes" },
  { href: "/reclutador/candidatos", icon: "candidatos", label: "Candidatos" },
  { href: "/reclutador/actividad", icon: "actividad", label: "Actividad" },
  { href: "/reclutador/reportes", icon: "reportes", label: "Reportes" },
  { href: "/reclutador/configuracion", icon: "configuracion", label: "Config." },
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
    <div className="min-h-screen bg-canvas">
      <Header
        nav={NAV}
        nombre={session.user.name ?? ""}
        badge="Administración"
        cuentaHref="/reclutador/cuenta"
      />
      <main className="max-w-[1200px] mx-auto">{children}</main>
    </div>
  );
}
