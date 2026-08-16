"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { put, del } from "@vercel/blob";

async function requireReclutador() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "RECLUTADOR"].includes(session.user.rol)) {
    throw new Error("No autorizado");
  }
}

const candidatoSchema = z.object({
  nombre: z.string().min(1),
  edad: z.coerce.number().int().positive().optional(),
  ciudad: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  experiencia: z.string().optional(),
  disponibilidad: z.string().optional(),
  salarioEsperado: z.coerce.number().int().positive().optional(),
});

export async function crearCandidato(formData: FormData) {
  await requireReclutador();
  const sectores = formData.getAll("sectores") as string[];
  const data = candidatoSchema.parse({
    nombre: formData.get("nombre"),
    edad: formData.get("edad") || undefined,
    ciudad: formData.get("ciudad") || undefined,
    telefono: formData.get("telefono") || undefined,
    email: formData.get("email") || undefined,
    experiencia: formData.get("experiencia") || undefined,
    disponibilidad: formData.get("disponibilidad") || undefined,
    salarioEsperado: formData.get("salarioEsperado") || undefined,
  });

  await prisma.candidato.create({
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

  revalidatePath("/reclutador/candidatos");
}

export async function eliminarCandidato(id: string) {
  await requireReclutador();
  await prisma.candidato.delete({ where: { id } });
  revalidatePath("/reclutador/candidatos");
}

export async function subirDocumento(candidatoId: string, tipo: string, formData: FormData) {
  await requireReclutador();
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

  revalidatePath("/reclutador/candidatos");
}

export async function quitarDocumento(candidatoId: string, tipo: string) {
  await requireReclutador();
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
  revalidatePath("/reclutador/candidatos");
}
