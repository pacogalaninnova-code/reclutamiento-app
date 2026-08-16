import { prisma } from "@/lib/prisma";
import { Card, StatTile, Badge } from "@/components/ui";
import { TEMPORADA_INFO, SECTOR_LABEL, TIPO_CONTRATO_LABEL, fmt, comision } from "@/lib/dominio";
import { Building2, Briefcase, Users, Wallet, CalendarClock } from "lucide-react";

export default async function DashboardPage() {
  const [empresas, vacantes, candidatosDisponibles] = await Promise.all([
    prisma.empresa.count(),
    prisma.vacante.findMany({
      include: {
        empresa: true,
        aplicaciones: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.candidato.count({ where: { estado: "DISPONIBLE" } }),
  ]);

  const vacantesActivas = vacantes.filter((v) => v.estado === "ACTIVA").length;

  const ingresosEstimados = vacantes.reduce((acc, v) => {
    const contratados = v.aplicaciones.filter((a) => a.etapa === "CONTRATADO").length;
    return acc + contratados * comision(v.salario);
  }, 0);

  const stats = [
    { label: "Empresas", value: empresas, icon: Building2, colorClass: "text-navy" },
    { label: "Vacantes activas", value: vacantesActivas, icon: Briefcase, colorClass: "text-accent" },
    { label: "Candidatos disp.", value: candidatosDisponibles, icon: Users, colorClass: "text-green" },
    { label: "Ingresos est.", value: fmt(ingresosEstimados), icon: Wallet, colorClass: "text-highlight" },
  ];

  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-navy to-navy-dark rounded-2xl px-6 py-5 mb-5 flex justify-between items-center">
        <div>
          <div className="text-white/40 text-[10px] font-bold tracking-widest mb-1">
            RESUMEN GENERAL
          </div>
          <div className="text-white text-xl font-extrabold">
            {vacantesActivas} vacante{vacantesActivas === 1 ? "" : "s"} activa{vacantesActivas === 1 ? "" : "s"}
          </div>
          <div className="text-white/60 text-xs font-semibold mt-1">
            {candidatosDisponibles} candidato{candidatosDisponibles === 1 ? "" : "s"} disponible{candidatosDisponibles === 1 ? "" : "s"} en tu base
          </div>
        </div>
        <div className="text-right">
          <Badge colorClass="text-highlight bg-highlight/20">Comisión: 1 mes de sueldo</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <StatTile key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <Card>
          <div className="text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">
            ESTADO DE VACANTES
          </div>
          {vacantes.length === 0 && (
            <div className="text-muted text-sm text-center py-4">Sin vacantes aún</div>
          )}
          {vacantes.map((v) => {
            const t = v.temporada ? TEMPORADA_INFO[v.temporada] : null;
            const contratados = v.aplicaciones.filter((a) => a.etapa === "CONTRATADO").length;
            return (
              <div key={v.id} className="py-2.5 border-b border-border last:border-0">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-text text-[13px]">{v.puesto}</div>
                    <div className="text-muted text-[11px] mt-0.5">
                      {v.ciudad} · {v.plazas} plazas · {v.empresa.nombre}
                    </div>
                  </div>
                  <Badge estado={v.estado}>{v.estado}</Badge>
                </div>
                <div className="mt-1 flex gap-1.5 items-center flex-wrap">
                  {t ? (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ color: t.color, background: t.bg }}
                    >
                      <t.icono size={10} />
                      {t.label}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-blue bg-[#E9EFF4]">
                      {TIPO_CONTRATO_LABEL[v.tipoContrato]}
                    </span>
                  )}
                  <span className="text-[11px] text-muted">{SECTOR_LABEL[v.sector]}</span>
                  {contratados > 0 && (
                    <span className="text-[11px] text-highlight font-bold">
                      +{fmt(contratados * comision(v.salario))}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">
            <CalendarClock size={13} />
            TEMPORADAS DE REFERENCIA
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(TEMPORADA_INFO).map(([key, t]) => (
              <div key={key} className="flex items-center gap-2.5 py-1.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: t.bg, color: t.color }}
                >
                  <t.icono size={14} />
                </div>
                <div>
                  <div className="font-bold text-[12px] text-text">{t.label}</div>
                  <div className="text-[11px] text-muted">{t.meses}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
