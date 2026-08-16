import { prisma } from "@/lib/prisma";
import { Card, StatTile, Badge } from "@/components/ui";
import { TEMPORADA_INFO, SECTOR_LABEL, fmt, comision } from "@/lib/dominio";

const TEMPORADA_MES: Record<string, number> = {
  SEMANA_SANTA: 3,
  VERANO: 7,
  FIESTAS_PATRIAS: 9,
  FIN_DE_ANO: 11,
};

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

  const mesActual = new Date().getMonth() + 1;
  const temporadasOrdenadas = Object.entries(TEMPORADA_INFO).sort((a, b) => {
    const ma = TEMPORADA_MES[a[0]];
    const mb = TEMPORADA_MES[b[0]];
    const da = ma >= mesActual ? ma - mesActual : ma + 12 - mesActual;
    const db = mb >= mesActual ? mb - mesActual : mb + 12 - mesActual;
    return da - db;
  });
  const [, proxima] = temporadasOrdenadas[0];

  const stats = [
    { label: "Empresas", value: empresas, icon: "🏢", colorClass: "text-navy" },
    { label: "Vacantes activas", value: vacantesActivas, icon: "📋", colorClass: "text-coral" },
    { label: "Candidatos disp.", value: candidatosDisponibles, icon: "👥", colorClass: "text-green" },
    { label: "Ingresos est.", value: fmt(ingresosEstimados), icon: "💰", colorClass: "text-gold" },
  ];

  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-navy to-navy-dark rounded-2xl px-6 py-5 mb-5 flex justify-between items-center">
        <div>
          <div className="text-white/40 text-[10px] font-bold tracking-widest mb-1">
            PRÓXIMA TEMPORADA
          </div>
          <div className="text-white text-xl font-extrabold">
            {proxima.icono} {proxima.label}
          </div>
          <div className="text-gold text-xs font-semibold mt-1">{proxima.meses}</div>
        </div>
        <div className="text-right">
          <Badge colorClass="text-gold bg-gold/20">⚡ Comisión: 1 mes de sueldo</Badge>
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
            📅 CALENDARIO DE TEMPORADAS
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(TEMPORADA_INFO).map(([key, t]) => (
              <div
                key={key}
                className="rounded-xl p-3.5"
                style={{ background: t.bg, border: `2px solid ${t.color}22` }}
              >
                <div className="text-xl mb-1">{t.icono}</div>
                <div className="font-extrabold text-[13px]" style={{ color: t.color }}>
                  {t.label}
                </div>
                <div className="text-[11px] text-muted font-semibold">{t.meses}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">
            📋 ESTADO DE VACANTES
          </div>
          {vacantes.length === 0 && (
            <div className="text-muted text-sm text-center py-4">Sin vacantes aún</div>
          )}
          {vacantes.map((v) => {
            const t = TEMPORADA_INFO[v.temporada];
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
                <div className="mt-1 flex gap-1.5 items-center">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ color: t.color, background: t.bg }}
                  >
                    {t.icono} {t.label}
                  </span>
                  <span className="text-[11px] text-muted">{SECTOR_LABEL[v.sector]}</span>
                  {contratados > 0 && (
                    <span className="text-[11px] text-gold font-bold">
                      +{fmt(contratados * comision(v.salario))}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
