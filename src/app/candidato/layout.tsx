import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";

const NAV = [{ href: "/candidato", icon: "🏠", label: "Mi Proceso" }];

export default async function CandidatoLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "CANDIDATO" || !session.user.candidatoId) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header nav={NAV} nombre={session.user.name ?? ""} badge="Portal Candidato" />
      <main className="max-w-[900px] mx-auto">{children}</main>
    </div>
  );
}
