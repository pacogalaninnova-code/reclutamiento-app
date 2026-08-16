"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { put, del } from "@vercel/blob";

async function requireCandidato() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "CANDIDATO" || !session.user.candidatoId) {
    throw new Error("No autorizado");
  }
  return session.user.candidatoId;
}

export async function subirMiDocumento(tipo: string, formData: FormData) {
  const candidatoId = await requireCandidato();
  const file = formData.get("archivo") as File | null;
  if (!file || file.size === 0) return;

  const blob = await put(`candidatos/${candidatoId}/${tipo}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await prisma.documento.upsert({
    where: { candidatoId_tipo: { candidatoId, tipo: tipo as never } },
    create: {
      candidatoId,
      tipo: tipo as never,
      estado: "ADJUNTO",
      nombreArchivo: file.name,
      url: blob.url,
      uploadedAt: new Date(),
    },
    update: {
      estado: "ADJUNTO",
      nombreArchivo: file.name,
      url: blob.url,
      uploadedAt: new Date(),
    },
  });

  revalidatePath("/candidato");
}

export async function quitarMiDocumento(tipo: string) {
  const candidatoId = await requireCandidato();
  const doc = await prisma.documento.findUnique({
    where: { candidatoId_tipo: { candidatoId, tipo: tipo as never } },
  });
  if (doc?.url) {
    try {
      await del(doc.url);
    } catch {
      // el blob ya pudo haber sido eliminado
    }
  }
  await prisma.documento.upsert({
    where: { candidatoId_tipo: { candidatoId, tipo: tipo as never } },
    create: { candidatoId, tipo: tipo as never, estado: "PENDIENTE" },
    update: { estado: "PENDIENTE", nombreArchivo: null, url: null, uploadedAt: null },
  });
  revalidatePath("/candidato");
}
