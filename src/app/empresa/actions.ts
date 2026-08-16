"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { registrarActividad } from "@/lib/actividad";

const empresaSchema = z.object({
  nombre: z.string().min(1),
  sector: z.string().min(1),
  ciudad: z.string().min(1),
  contacto: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().optional(),
});

export async function editarMiEmpresa(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "EMPRESA" || !session.user.empresaId) {
    throw new Error("No autorizado");
  }

  const data = empresaSchema.parse({
    nombre: formData.get("nombre"),
    sector: formData.get("sector"),
    ciudad: formData.get("ciudad"),
    contacto: formData.get("contacto") || undefined,
    email: formData.get("email") || undefined,
    telefono: formData.get("telefono") || undefined,
  });

  await prisma.empresa.update({
    where: { id: session.user.empresaId },
    data: {
      nombre: data.nombre,
      sector: data.sector as never,
      ciudad: data.ciudad,
      contacto: data.contacto || null,
      email: data.email || null,
      telefono: data.telefono || null,
    },
  });

  await registrarActividad({
    tipo: "PERFIL_EMPRESA_ACTUALIZADO",
    descripcion: `${data.nombre} actualizó los datos de su empresa.`,
    actorRol: "EMPRESA",
    actorNombre: data.nombre,
    empresaId: session.user.empresaId,
  });

  revalidatePath("/empresa/cuenta");
  revalidatePath("/reclutador/empresas");
  revalidatePath("/reclutador/actividad");
}
