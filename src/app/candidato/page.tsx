import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CandidatoView } from "./candidato-view";

export default async function CandidatoPage() {
  const session = await auth();
  const candidato = await prisma.candidato.findUniqueOrThrow({
    where: { id: session!.user.candidatoId! },
    include: {
      documentos: true,
      aplicaciones: {
        include: { vacante: { include: { empresa: { select: { nombre: true } } } } },
      },
    },
  });

  return <CandidatoView candidato={candidato} />;
}
