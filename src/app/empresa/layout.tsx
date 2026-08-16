import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";

const NAV = [{ href: "/empresa/vacantes", icon: "vacantes", label: "Mis Vacantes" }];

export default async function EmpresaLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "EMPRESA" || !session.user.empresaId) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Header nav={NAV} nombre={session.user.name ?? ""} badge="Portal Empresa" cuentaHref="/empresa/cuenta" />
      <main className="max-w-[1200px] mx-auto">{children}</main>
    </div>
  );
}
