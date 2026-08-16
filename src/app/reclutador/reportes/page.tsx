import { prisma } from "@/lib/prisma";
import { Card, StatTile } from "@/components/ui";
import { TEMPORADA_INFO, fmt, comision } from "@/lib/dominio";

export default async function ReportesPage() {
  const aplicaciones = await prisma.aplicacion.findMany({
    where: { etapa: "CONTRATADO" },
    include: {
      candidato: { select: { nombre: true } },
      vacante: { include: { empresa: { select: { nombre: true } } } },
    },
  });

  const contratados = aplicaciones.map((a) => ({
    candidato: a.candidato.nombre,
    puesto: a.vacante.puesto,
    empresa: a.vacante.empresa.nombre,
    temporada: a.vacante.temporada,
    salario: a.vacante.salario,
    comision: comision(a.vacante.salario),
  }));

  const total = contratados.reduce((acc, x) => acc + x.comision, 0);
  const promedio = contratados.length ? Math.round(total / contratados.length) : 0;

  return (
    <div className="p-6">
      <h2 className="text-xl font-extrabold text-navy mb-5">Reportes & Ingresos</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        <StatTile label="Ingresos totales est." value={fmt(total)} icon="💰" colorClass="text-gold" />
        <StatTile label="Contrataciones" value={contratados.length} icon="✅" colorClass="text-green" />
        <StatTile label="Promedio/contratación" value={fmt(promedio)} icon="📊" colorClass="text-coral" />
      </div>

      <Card className="mb-5">
        <div className="text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">
          📅 INGRESOS POR TEMPORADA
        </div>
        {Object.entries(TEMPORADA_INFO).map(([key, t]) => {
          const items = contratados.filter((x) => x.temporada === key);
          const monto = items.reduce((a, x) => a + x.comision, 0);
          return (
            <div key={key} className="flex items-center gap-3.5 py-3 border-b border-border last:border-0">
              <span className="text-xl">{t.icono}</span>
              <div className="flex-1">
                <div className="font-bold text-text text-[13px]">{t.label}</div>
                <div className="text-muted text-[11px] mt-0.5">{t.meses} · {items.length} contratación(es)</div>
              </div>
              <div className={`font-extrabold text-[15px] ${items.length > 0 ? "text-gold" : "text-muted"}`}>
                {fmt(monto)}
              </div>
            </div>
          );
        })}
      </Card>

      {contratados.length > 0 && (
        <Card>
          <div className="text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">✅ DETALLE</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-border">
                  {["Candidato", "Puesto", "Empresa", "Temporada", "Salario", "Comisión"].map((h) => (
                    <th key={h} className="text-left px-2.5 py-1.5 text-muted font-bold text-[11px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contratados.map((x, i) => {
                  const t = TEMPORADA_INFO[x.temporada];
                  return (
                    <tr key={i} className="border-b border-border">
                      <td className="px-2.5 py-2 font-bold text-navy">{x.candidato}</td>
                      <td className="px-2.5 py-2">{x.puesto}</td>
                      <td className="px-2.5 py-2">{x.empresa}</td>
                      <td className="px-2.5 py-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ color: t.color, background: t.bg }}
                        >
                          {t.icono} {t.label}
                        </span>
                      </td>
                      <td className="px-2.5 py-2">{fmt(x.salario)}</td>
                      <td className="px-2.5 py-2 font-bold text-gold">{fmt(x.comision)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
