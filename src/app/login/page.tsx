import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { auth } from "@/auth";

const PORTAL_POR_ROL: Record<string, string> = {
  ADMIN: "/reclutador",
  RECLUTADOR: "/reclutador",
  EMPRESA: "/empresa",
  CANDIDATO: "/candidato",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.rol) {
    redirect(PORTAL_POR_ROL[session.user.rol] ?? "/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy to-navy-dark">
      <div className="bg-white rounded-[20px] p-10 w-[340px] shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-coral rounded-2xl w-[52px] h-[52px] flex items-center justify-center text-2xl mx-auto mb-3.5">
            ⚡
          </div>
          <div className="font-extrabold text-2xl text-navy">
            Talento<span className="text-coral">Temp</span>
          </div>
          <div className="text-xs text-muted mt-1 tracking-wide">
            CHIAPAS · RECLUTAMIENTO DE TEMPORADA
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
