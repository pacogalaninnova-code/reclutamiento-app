import { prisma } from "@/lib/prisma";
import { enviarCorreo } from "@/lib/email";
import { APP_NAME } from "@/lib/marca";

type RegistrarActividadInput = {
  tipo:
    | "VACANTE_SOLICITADA"
    | "PERFIL_EMPRESA_ACTUALIZADO"
    | "PERFIL_CANDIDATO_ACTUALIZADO"
    | "DOCUMENTO_SUBIDO"
    | "DOCUMENTO_ELIMINADO"
    | "PASSWORD_CAMBIADO";
  descripcion: string;
  actorRol: "EMPRESA" | "CANDIDATO";
  actorNombre: string;
  empresaId?: string;
  candidatoId?: string;
};

export async function registrarActividad(input: RegistrarActividadInput) {
  await prisma.actividad.create({
    data: {
      tipo: input.tipo,
      descripcion: input.descripcion,
      actorRol: input.actorRol,
      actorNombre: input.actorNombre,
      empresaId: input.empresaId,
      candidatoId: input.candidatoId,
    },
  });

  const admins = await prisma.usuario.findMany({
    where: { rol: { in: ["ADMIN", "RECLUTADOR"] } },
    select: { email: true },
  });

  await Promise.all(
    admins.map((admin) =>
      enviarCorreo({
        to: admin.email,
        subject: `${APP_NAME} — Nueva actividad: ${input.actorNombre}`,
        text: input.descripcion,
      })
    )
  );
}
