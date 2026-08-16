import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { EmpresaVacantesView } from "./empresa-vacantes-view";

export default async function EmpresaVacantesPage() {
  const session = await auth();
  const vacantes = await prisma.vacante.findMany({
    where: { empresaId: session!.user.empresaId! },
    orderBy: { createdAt: "desc" },
    include: {
      aplicaciones: {
        include: { candidato: { select: { nombre: true } } },
      },
    },
  });

  return <EmpresaVacantesView vacantes={vacantes} />;
}
