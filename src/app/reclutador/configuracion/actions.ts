"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "ADMIN") {
    throw new Error("Solo un administrador puede gestionar usuarios");
  }
  return session;
}

async function requireReclutador() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "RECLUTADOR"].includes(session.user.rol)) {
    throw new Error("No autorizado");
  }
}

const usuarioSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(["ADMIN", "RECLUTADOR"]),
});

export async function crearUsuario(formData: FormData) {
  await requireAdmin();
  const data = usuarioSchema.parse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    rol: formData.get("rol"),
  });

  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.usuario.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      passwordHash,
      rol: data.rol,
    },
  });

  revalidatePath("/reclutador/configuracion");
}

export async function eliminarUsuario(id: string) {
  await requireAdmin();
  await prisma.usuario.delete({ where: { id } });
  revalidatePath("/reclutador/configuracion");
}

export async function eliminarRegistro(tipo: "empresa" | "vacante" | "candidato", id: string) {
  await requireReclutador();
  if (tipo === "empresa") await prisma.empresa.delete({ where: { id } });
  if (tipo === "vacante") await prisma.vacante.delete({ where: { id } });
  if (tipo === "candidato") await prisma.candidato.delete({ where: { id } });
  revalidatePath("/reclutador/configuracion");
}
