import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ConfiguracionView } from "./configuracion-view";

export default async function ConfiguracionPage() {
  const session = await auth();
  const [usuarios, empresas, vacantes, candidatos] = await Promise.all([
    prisma.usuario.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.empresa.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.vacante.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.candidato.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <ConfiguracionView
      esAdmin={session?.user?.rol === "ADMIN"}
      usuarios={usuarios.map((u) => ({ id: u.id, nombre: u.nombre, sub: `${u.email} · ${u.rol}` }))}
      empresas={empresas.map((e) => ({ id: e.id, nombre: e.nombre, sub: `${e.sector} · ${e.ciudad}` }))}
      vacantes={vacantes.map((v) => ({ id: v.id, nombre: v.puesto, sub: `${v.ciudad} · ${v.temporada}` }))}
      candidatos={candidatos.map((c) => ({ id: c.id, nombre: c.nombre, sub: `${c.ciudad ?? "-"} · ${c.estado}` }))}
    />
  );
}
