import { prisma } from "@/lib/prisma";
import { EmpresasView } from "./empresas-view";

export default async function EmpresasPage() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { vacantes: true } } },
  });

  return <EmpresasView empresas={empresas} />;
}
