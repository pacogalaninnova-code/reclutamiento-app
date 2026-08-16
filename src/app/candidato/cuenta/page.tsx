import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CambiarPasswordForm } from "@/components/cambiar-password-form";
import { CandidatoPerfilForm } from "./candidato-perfil-form";

export default async function CuentaPage() {
  const session = await auth();
  const candidato = await prisma.candidato.findUniqueOrThrow({
    where: { id: session!.user.candidatoId! },
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-extrabold text-navy mb-5">Mi Cuenta</h2>
      <CandidatoPerfilForm candidato={candidato} />
      <CambiarPasswordForm />
    </div>
  );
}
