import { prisma } from "@/lib/prisma";
import { CandidatosView } from "./candidatos-view";

export default async function CandidatosPage() {
  const candidatos = await prisma.candidato.findMany({
    orderBy: { createdAt: "desc" },
    include: { documentos: true },
  });

  return <CandidatosView candidatos={candidatos} />;
}
