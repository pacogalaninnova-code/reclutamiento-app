"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { siguienteEtapa } from "@/lib/dominio";

async function requireReclutador() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "RECLUTADOR"].includes(session.user.rol)) {
    throw new Error("No autorizado");
  }
}

const vacanteSchema = z.object({
  empresaId: z.string().min(1),
  puesto: z.string().min(1),
  sector: z.string().min(1),
  ciudad: z.string().min(1),
  plazas: z.coerce.number().int().positive(),
  salario: z.coerce.number().int().positive(),
  temporada: z.string().min(1),
});

export async function crearVacante(formData: FormData) {
  await requireReclutador();
  const data = vacanteSchema.parse({
    empresaId: formData.get("empresaId"),
    puesto: formData.get("puesto"),
    sector: formData.get("sector"),
    ciudad: formData.get("ciudad"),
    plazas: formData.get("plazas"),
    salario: formData.get("salario"),
    temporada: formData.get("temporada"),
  });

  await prisma.vacante.create({
    data: {
      empresaId: data.empresaId,
      puesto: data.puesto,
      sector: data.sector as never,
      ciudad: data.ciudad,
      plazas: data.plazas,
      salario: data.salario,
      temporada: data.temporada as never,
    },
  });

  revalidatePath("/reclutador/vacantes");
}

async function actualizarEstadoVacante(vacanteId: string) {
  const vacante = await prisma.vacante.findUniqueOrThrow({
    where: { id: vacanteId },
    include: { aplicaciones: true },
  });
  const contratados = vacante.aplicaciones.filter((a) => a.etapa === "CONTRATADO").length;
  await prisma.vacante.update({
    where: { id: vacanteId },
    data: { estado: contratados >= vacante.plazas ? "CUBIERTA" : "ACTIVA" },
  });
}

export async function agregarCandidato(vacanteId: string, candidatoId: string) {
  await requireReclutador();
  await prisma.aplicacion.upsert({
    where: { vacanteId_candidatoId: { vacanteId, candidatoId } },
    create: { vacanteId, candidatoId, etapa: "APLICO", termometro: 5 },
    update: {},
  });
  revalidatePath("/reclutador/vacantes");
}

export async function avanzarEtapa(vacanteId: string, candidatoId: string) {
  await requireReclutador();
  const aplicacion = await prisma.aplicacion.findUniqueOrThrow({
    where: { vacanteId_candidatoId: { vacanteId, candidatoId } },
  });
  const siguiente = siguienteEtapa(aplicacion.etapa);
  if (!siguiente) return;

  await prisma.aplicacion.update({
    where: { vacanteId_candidatoId: { vacanteId, candidatoId } },
    data: { etapa: siguiente as never },
  });

  if (siguiente === "CONTRATADO") {
    await prisma.candidato.update({
      where: { id: candidatoId },
      data: { estado: "CONTRATADO" },
    });
  }

  await actualizarEstadoVacante(vacanteId);
  revalidatePath("/reclutador/vacantes");
  revalidatePath("/reclutador/reportes");
  revalidatePath("/reclutador/dashboard");
}

export async function setTermometro(vacanteId: string, candidatoId: string, valor: number) {
  await requireReclutador();
  await prisma.aplicacion.update({
    where: { vacanteId_candidatoId: { vacanteId, candidatoId } },
    data: { termometro: valor },
  });
  revalidatePath("/reclutador/vacantes");
}
