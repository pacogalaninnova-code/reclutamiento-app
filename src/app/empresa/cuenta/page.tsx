import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CambiarPasswordForm } from "@/components/cambiar-password-form";
import { EmpresaPerfilForm } from "./empresa-perfil-form";

export default async function CuentaPage() {
  const session = await auth();
  const empresa = await prisma.empresa.findUniqueOrThrow({
    where: { id: session!.user.empresaId! },
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-extrabold text-navy mb-5">Mi Cuenta</h2>
      <EmpresaPerfilForm empresa={empresa} />
      <CambiarPasswordForm />
    </div>
  );
}
