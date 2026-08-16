"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { registrarActividad } from "@/lib/actividad";

const vacanteSchema = z.object({
  puesto: z.string().min(1),
  sector: z.string().min(1),
  ciudad: z.string().min(1),
  plazas: z.coerce.number().int().positive(),
  salario: z.coerce.number().int().positive(),
  tipoContrato: z.enum(["PERMANENTE", "TEMPORAL"]),
  temporada: z.string().optional(),
});

export async function solicitarVacante(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "EMPRESA" || !session.user.empresaId) {
    throw new Error("No autorizado");
  }

  const data = vacanteSchema.parse({
    puesto: formData.get("puesto"),
    sector: formData.get("sector"),
    ciudad: formData.get("ciudad"),
    plazas: formData.get("plazas"),
    salario: formData.get("salario"),
    tipoContrato: formData.get("tipoContrato"),
    temporada: formData.get("temporada") || undefined,
  });

  const empresa = await prisma.empresa.findUniqueOrThrow({
    where: { id: session.user.empresaId },
  });

  await prisma.vacante.create({
    data: {
      empresaId: session.user.empresaId,
      puesto: data.puesto,
      sector: data.sector as never,
      ciudad: data.ciudad,
      plazas: data.plazas,
      salario: data.salario,
      tipoContrato: data.tipoContrato,
      temporada: data.tipoContrato === "TEMPORAL" ? (data.temporada as never) : null,
      estado: "PENDIENTE",
    },
  });

  await registrarActividad({
    tipo: "VACANTE_SOLICITADA",
    descripcion: `${empresa.nombre} solicitó la vacante "${data.puesto}" (${data.plazas} plaza${data.plazas > 1 ? "s" : ""}).`,
    actorRol: "EMPRESA",
    actorNombre: empresa.nombre,
    empresaId: empresa.id,
  });

  revalidatePath("/empresa/vacantes");
  revalidatePath("/reclutador/vacantes");
  revalidatePath("/reclutador/actividad");
}
