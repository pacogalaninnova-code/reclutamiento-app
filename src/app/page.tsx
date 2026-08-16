import { redirect } from "next/navigation";
import { auth } from "@/auth";

const PORTAL_POR_ROL: Record<string, string> = {
  ADMIN: "/reclutador",
  RECLUTADOR: "/reclutador",
  EMPRESA: "/empresa",
  CANDIDATO: "/candidato",
};

export default async function Home() {
  const session = await auth();
  redirect(
    session?.user?.rol ? (PORTAL_POR_ROL[session.user.rol] ?? "/login") : "/login"
  );
}
