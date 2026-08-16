"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { put, del } from "@vercel/blob";
import { registrarActividad } from "@/lib/actividad";
import { DOCUMENTOS } from "@/lib/dominio";

async function requireCandidato() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "CANDIDATO" || !session.user.candidatoId) {
    throw new Error("No autorizado");
  }
  return session.user.candidatoId;
}

function labelDocumento(tipo: string): string {
  return DOCUMENTOS.find((d) => d.key === tipo)?.label ?? tipo;
}

const perfilSchema = z.object({
  nombre: z.string().min(1),
  edad: z.coerce.number().int().positive().optional(),
  ciudad: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  experiencia: z.string().optional(),
  disponibilidad: z.string().optional(),
  salarioEsperado: z.coerce.number().int().positive().optional(),
});

export async function editarMiPerfil(formData: FormData) {
  const candidatoId = await requireCandidato();
  const sectores = formData.getAll("sectores") as string[];
  const data = perfilSchema.parse({
    nombre: formData.get("nombre"),
    edad: formData.get("edad") || undefined,
    ciudad: formData.get("ciudad") || undefined,
    telefono: formData.get("telefono") || undefined,
    email: formData.get("email") || undefined,
    experiencia: formData.get("experiencia") || undefined,
    disponibilidad: formData.get("disponibilidad") || undefined,
    salarioEsperado: formData.get("salarioEsperado") || undefined,
  });

  await prisma.candidato.update({
    where: { id: candidatoId },
    data: {
      nombre: data.nombre,
      edad: data.edad,
      ciudad: data.ciudad || null,
      telefono: data.telefono || null,
      email: data.email || null,
      experiencia: data.experiencia || null,
      disponibilidad: data.disponibilidad || null,
      salarioEsperado: data.salarioEsperado,
      sectores: sectores as never,
    },
  });

  await registrarActividad({
    tipo: "PERFIL_CANDIDATO_ACTUALIZADO",
    descripcion: `${data.nombre} actualizó su perfil de candidato.`,
    actorRol: "CANDIDATO",
    actorNombre: data.nombre,
    candidatoId,
  });

  revalidatePath("/candidato");
  revalidatePath("/candidato/cuenta");
  revalidatePath("/reclutador/candidatos");
  revalidatePath("/reclutador/actividad");
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

  const candidato = await prisma.candidato.findUniqueOrThrow({ where: { id: candidatoId } });
  await registrarActividad({
    tipo: "DOCUMENTO_SUBIDO",
    descripcion: `${candidato.nombre} subió su documento: ${labelDocumento(tipo)}.`,
    actorRol: "CANDIDATO",
    actorNombre: candidato.nombre,
    candidatoId,
  });

  revalidatePath("/candidato");
  revalidatePath("/reclutador/candidatos");
  revalidatePath("/reclutador/actividad");
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

  const candidato = await prisma.candidato.findUniqueOrThrow({ where: { id: candidatoId } });
  await registrarActividad({
    tipo: "DOCUMENTO_ELIMINADO",
    descripcion: `${candidato.nombre} eliminó su documento: ${labelDocumento(tipo)}.`,
    actorRol: "CANDIDATO",
    actorNombre: candidato.nombre,
    candidatoId,
  });

  revalidatePath("/candidato");
  revalidatePath("/reclutador/candidatos");
  revalidatePath("/reclutador/actividad");
}
