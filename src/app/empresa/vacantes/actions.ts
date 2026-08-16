"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const vacanteSchema = z.object({
  puesto: z.string().min(1),
  sector: z.string().min(1),
  ciudad: z.string().min(1),
  plazas: z.coerce.number().int().positive(),
  salario: z.coerce.number().int().positive(),
  temporada: z.string().min(1),
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
    temporada: formData.get("temporada"),
  });

  await prisma.vacante.create({
    data: {
      empresaId: session.user.empresaId,
      puesto: data.puesto,
      sector: data.sector as never,
      ciudad: data.ciudad,
      plazas: data.plazas,
      salario: data.salario,
      temporada: data.temporada as never,
    },
  });

  revalidatePath("/empresa/vacantes");
}
