"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { registrarActividad } from "@/lib/actividad";

const passwordSchema = z
  .object({
    passwordActual: z.string().min(1),
    passwordNueva: z.string().min(6),
    passwordConfirmar: z.string().min(6),
  })
  .refine((data) => data.passwordNueva === data.passwordConfirmar, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmar"],
  });

export type CambiarPasswordResult = { ok: true } | { ok: false; error: string };

export async function cambiarPassword(formData: FormData): Promise<CambiarPasswordResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "No autorizado" };
  }

  const parsed = passwordSchema.safeParse({
    passwordActual: formData.get("passwordActual"),
    passwordNueva: formData.get("passwordNueva"),
    passwordConfirmar: formData.get("passwordConfirmar"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: session.user.id } });
  const valido = await bcrypt.compare(parsed.data.passwordActual, usuario.passwordHash);
  if (!valido) {
    return { ok: false, error: "La contraseña actual es incorrecta" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.passwordNueva, 10);
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { passwordHash },
  });

  if (usuario.rol === "EMPRESA" || usuario.rol === "CANDIDATO") {
    await registrarActividad({
      tipo: "PASSWORD_CAMBIADO",
      descripcion: `${usuario.nombre} cambió su contraseña.`,
      actorRol: usuario.rol,
      actorNombre: usuario.nombre,
      empresaId: usuario.empresaId ?? undefined,
      candidatoId: usuario.candidatoId ?? undefined,
    });
  }

  return { ok: true };
}
