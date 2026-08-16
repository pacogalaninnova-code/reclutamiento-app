import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import {
  Briefcase,
  Building2,
  User,
  FileUp,
  FileX,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

const ICONO_TIPO: Record<string, LucideIcon> = {
  VACANTE_SOLICITADA: Briefcase,
  PERFIL_EMPRESA_ACTUALIZADO: Building2,
  PERFIL_CANDIDATO_ACTUALIZADO: User,
  DOCUMENTO_SUBIDO: FileUp,
  DOCUMENTO_ELIMINADO: FileX,
  PASSWORD_CAMBIADO: KeyRound,
};

const formateador = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ActividadPage() {
  const actividades = await prisma.actividad.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-navy">Actividad</h2>
        <p className="text-muted text-sm mt-0.5">
          Movimientos generados por empresas y candidatos
        </p>
      </div>

      <Card>
        {actividades.length === 0 && (
          <div className="text-muted text-sm text-center py-8">
            Aún no hay movimientos registrados.
          </div>
        )}
        {actividades.map((a) => {
          const Icon = ICONO_TIPO[a.tipo] ?? User;
          return (
            <div
              key={a.id}
              className="flex items-start gap-3 py-3 border-b border-border last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-canvas border border-border flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={15} className="text-navy" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text">{a.descripcion}</div>
                <div className="text-[11px] text-muted mt-0.5">
                  {formateador.format(a.createdAt)}
                </div>
              </div>
              <Badge colorClass="text-muted bg-[#f1f5f9]">
                {a.actorRol === "EMPRESA" ? "Empresa" : "Candidato"}
              </Badge>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
