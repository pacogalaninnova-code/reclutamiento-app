import { prisma } from "@/lib/prisma";
import { VacantesView } from "./vacantes-view";

export default async function VacantesPage() {
  const [vacantes, empresas, candidatos] = await Promise.all([
    prisma.vacante.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        empresa: { select: { id: true, nombre: true } },
        aplicaciones: {
          include: {
            candidato: {
              select: { id: true, nombre: true, ciudad: true, edad: true, telefono: true, email: true },
            },
          },
        },
      },
    }),
    prisma.empresa.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    prisma.candidato.findMany({
      select: { id: true, nombre: true, experiencia: true, sectores: true, estado: true },
    }),
  ]);

  return <VacantesView vacantes={vacantes} empresas={empresas} candidatos={candidatos} />;
}
