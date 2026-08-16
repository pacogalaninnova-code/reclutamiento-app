"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const empresaSchema = z.object({
  nombre: z.string().min(1),
  sector: z.string().min(1),
  ciudad: z.string().min(1),
  contacto: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().optional(),
  temporadaPrincipal: z.string().optional(),
});

async function requireReclutador() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "RECLUTADOR"].includes(session.user.rol)) {
    throw new Error("No autorizado");
  }
}

export async function crearEmpresa(formData: FormData) {
  await requireReclutador();
  const data = empresaSchema.parse({
    nombre: formData.get("nombre"),
    sector: formData.get("sector"),
    ciudad: formData.get("ciudad"),
    contacto: formData.get("contacto") || undefined,
    email: formData.get("email") || undefined,
    telefono: formData.get("telefono") || undefined,
    temporadaPrincipal: formData.get("temporadaPrincipal") || undefined,
  });

  await prisma.empresa.create({
    data: {
      nombre: data.nombre,
      sector: data.sector as never,
      ciudad: data.ciudad,
      contacto: data.contacto || null,
      email: data.email || null,
      telefono: data.telefono || null,
      temporadaPrincipal: data.temporadaPrincipal
        ? (data.temporadaPrincipal as never)
        : null,
    },
  });

  revalidatePath("/reclutador/empresas");
}

export async function eliminarEmpresa(id: string) {
  await requireReclutador();
  await prisma.empresa.delete({ where: { id } });
  revalidatePath("/reclutador/empresas");
}
