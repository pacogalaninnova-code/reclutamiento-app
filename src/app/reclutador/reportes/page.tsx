import { prisma } from "@/lib/prisma";
import { Card, StatTile } from "@/components/ui";
import { TEMPORADA_INFO, TIPO_CONTRATO_LABEL, fmt, comision } from "@/lib/dominio";
import { Wallet, CheckCircle2, BarChart3, ListChecks } from "lucide-react";

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
    tipoContrato: a.vacante.tipoContrato,
    temporada: a.vacante.temporada,
    salario: a.vacante.salario,
    comision: comision(a.vacante.salario),
  }));

  const total = contratados.reduce((acc, x) => acc + x.comision, 0);
  const promedio = contratados.length ? Math.round(total / contratados.length) : 0;
  const contratadosTemporales = contratados.filter((x) => x.temporada);

  return (
    <div className="p-6">
      <h2 className="text-xl font-extrabold text-navy mb-5">Reportes e Ingresos</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        <StatTile label="Ingresos totales est." value={fmt(total)} icon={Wallet} colorClass="text-highlight" />
        <StatTile label="Contrataciones" value={contratados.length} icon={CheckCircle2} colorClass="text-green" />
        <StatTile label="Promedio/contratación" value={fmt(promedio)} icon={BarChart3} colorClass="text-accent" />
      </div>

      <Card className="mb-5">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">
          <ListChecks size={13} />
          INGRESOS POR TIPO DE CONTRATO
        </div>
        {Object.entries(TIPO_CONTRATO_LABEL).map(([key, label]) => {
          const items = contratados.filter((x) => x.tipoContrato === key);
          const monto = items.reduce((a, x) => a + x.comision, 0);
          return (
            <div key={key} className="flex items-center gap-3.5 py-3 border-b border-border last:border-0">
              <div className="flex-1">
                <div className="font-bold text-text text-[13px]">{label}</div>
                <div className="text-muted text-[11px] mt-0.5">{items.length} contratación(es)</div>
              </div>
              <div className={`font-extrabold text-[15px] ${items.length > 0 ? "text-highlight" : "text-muted"}`}>
                {fmt(monto)}
              </div>
            </div>
          );
        })}
      </Card>

      {contratadosTemporales.length > 0 && (
        <Card className="mb-5">
          <div className="text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">
            INGRESOS POR TEMPORADA
          </div>
          {Object.entries(TEMPORADA_INFO).map(([key, t]) => {
            const items = contratadosTemporales.filter((x) => x.temporada === key);
            const monto = items.reduce((a, x) => a + x.comision, 0);
            return (
              <div key={key} className="flex items-center gap-3.5 py-3 border-b border-border last:border-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: t.bg, color: t.color }}
                >
                  <t.icono size={15} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-text text-[13px]">{t.label}</div>
                  <div className="text-muted text-[11px] mt-0.5">{t.meses} · {items.length} contratación(es)</div>
                </div>
                <div className={`font-extrabold text-[15px] ${items.length > 0 ? "text-highlight" : "text-muted"}`}>
                  {fmt(monto)}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {contratados.length > 0 && (
        <Card>
          <div className="text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">DETALLE</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-border">
                  {["Candidato", "Puesto", "Empresa", "Tipo", "Salario", "Comisión"].map((h) => (
                    <th key={h} className="text-left px-2.5 py-1.5 text-muted font-bold text-[11px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contratados.map((x, i) => {
                  const t = x.temporada ? TEMPORADA_INFO[x.temporada] : null;
                  return (
                    <tr key={i} className="border-b border-border">
                      <td className="px-2.5 py-2 font-bold text-navy">{x.candidato}</td>
                      <td className="px-2.5 py-2">{x.puesto}</td>
                      <td className="px-2.5 py-2">{x.empresa}</td>
                      <td className="px-2.5 py-2">
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
                            {TIPO_CONTRATO_LABEL[x.tipoContrato]}
                          </span>
                        )}
                      </td>
                      <td className="px-2.5 py-2">{fmt(x.salario)}</td>
                      <td className="px-2.5 py-2 font-bold text-highlight">{fmt(x.comision)}</td>
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
