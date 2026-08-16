"use client";

import { useState, useTransition } from "react";
import { Card, Badge, Button, Modal, Field, Input, Select, Termometro } from "@/components/ui";
import { SECTOR_LABEL, TEMPORADA_INFO, ETAPA_LABEL, ETAPA_COLOR, fmt, comision, siguienteEtapa } from "@/lib/dominio";
import { crearVacante, agregarCandidato, avanzarEtapa, setTermometro } from "./actions";

type Empresa = { id: string; nombre: string };
type Aplicacion = {
  candidatoId: string;
  etapa: string;
  termometro: number;
  candidato: { id: string; nombre: string; ciudad: string | null; edad: number | null; telefono: string | null; email: string | null };
};
type Vacante = {
  id: string;
  puesto: string;
  sector: string;
  ciudad: string;
  plazas: number;
  salario: number;
  temporada: string;
  estado: string;
  empresa: Empresa;
  aplicaciones: Aplicacion[];
};
type Candidato = { id: string; nombre: string; experiencia: string | null; sectores: string[]; estado: string };

export function VacantesView({
  vacantes,
  empresas,
  candidatos,
}: {
  vacantes: Vacante[];
  empresas: Empresa[];
  candidatos: Candidato[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [procId, setProcId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const vAct = vacantes.find((v) => v.id === procId) ?? null;
  const disponibles = vAct
    ? candidatos.filter(
        (c) =>
          c.estado !== "CONTRATADO" &&
          c.sectores.includes(vAct.sector) &&
          !vAct.aplicaciones.some((a) => a.candidatoId === c.id)
      )
    : [];

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await crearVacante(formData);
      setShowForm(false);
    });
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-navy">Vacantes de Temporada</h2>
          <p className="text-muted text-sm mt-0.5">
            {vacantes.filter((v) => v.estado === "ACTIVA").length} activas ·{" "}
            {vacantes.filter((v) => v.estado === "CUBIERTA").length} cubiertas
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Publicar Vacante</Button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${procId ? "lg:grid-cols-[1fr_1fr_1.1fr]" : "lg:grid-cols-3"} gap-3.5`}>
        {vacantes.map((v) => {
          const t = TEMPORADA_INFO[v.temporada];
          const contratados = v.aplicaciones.filter((a) => a.etapa === "CONTRATADO").length;
          const sel = v.id === procId;
          return (
            <Card
              key={v.id}
              className={`cursor-pointer ${sel ? "!border-coral !border-2" : ""}`}
              >
              <div onClick={() => setProcId(sel ? null : v.id)}>
                <div className="flex justify-between items-center">
                  <Badge estado={v.estado}>{v.estado}</Badge>
                  <span className="text-lg">{t.icono}</span>
                </div>
                <div className="font-extrabold text-navy text-[15px] mt-2.5">{v.puesto}</div>
                <div className="text-muted text-xs mt-0.5">📍 {v.ciudad} · {v.plazas} plaza(s)</div>
                <div className="text-muted text-xs mt-0.5">🏢 {v.empresa.nombre}</div>
                <div className="font-bold text-coral text-sm mt-1.5">
                  {fmt(v.salario)}<span className="text-muted font-normal">/mes</span>
                </div>
                <div className="bg-cream rounded-lg px-2.5 py-1.5 mt-2.5 flex justify-between items-center">
                  <span className="text-[11px] text-muted">Comisión est.</span>
                  <span className="text-xs font-extrabold text-gold">{fmt(contratados * comision(v.salario))}</span>
                </div>
                <div className="mt-2 text-[11px] text-coral font-bold text-right">Ver proceso →</div>
              </div>
            </Card>
          );
        })}

        {vAct && (
          <Card className="!border-coral/30 !border-2 overflow-y-auto max-h-[600px]">
            <div className="text-[11px] font-extrabold text-coral mb-1 tracking-wide">
              ⚡ PROCESO · {vAct.puesto}
            </div>
            <div className="text-xs text-muted mb-3.5">
              {vAct.aplicaciones.filter((a) => a.etapa === "CONTRATADO").length}/{vAct.plazas} plazas cubiertas
            </div>

            {vAct.aplicaciones.length === 0 && disponibles.length === 0 && (
              <div className="text-muted text-sm text-center py-4">Sin candidatos aún</div>
            )}

            {vAct.aplicaciones.map((a) => {
              const next = siguienteEtapa(a.etapa);
              return (
                <div key={a.candidatoId} className="py-3 border-b border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-navy text-[13px]">{a.candidato.nombre}</div>
                      <div className="text-muted text-[11px] mt-0.5">
                        {a.candidato.ciudad} · {a.candidato.edad ?? "-"} años
                      </div>
                    </div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${ETAPA_COLOR[a.etapa]}`}>
                      {ETAPA_LABEL[a.etapa]}
                    </span>
                  </div>
                  <Termometro
                    value={a.termometro}
                    onChange={(val) =>
                      startTransition(async () => setTermometro(vAct.id, a.candidatoId, val))
                    }
                  />
                  <div className="mt-2 flex gap-1.5 items-center flex-wrap">
                    {next && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          startTransition(async () => avanzarEtapa(vAct.id, a.candidatoId))
                        }
                      >
                        → {ETAPA_LABEL[next]}
                      </Button>
                    )}
                    {a.etapa === "CONTRATADO" && (
                      <span className="text-[11px] text-gold font-bold">
                        💰 Com. {fmt(comision(vAct.salario))}
                      </span>
                    )}
                    {a.candidato.telefono && (
                      <a
                        href={`https://wa.me/52${a.candidato.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hola ${a.candidato.nombre}, te contactamos de TalentTemp Chiapas sobre tu proceso: ${ETAPA_LABEL[a.etapa]}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-border text-muted"
                      >
                        📣 Notificar
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {disponibles.length > 0 && (
              <div className="mt-3.5 pt-3.5 border-t-2 border-dashed border-border">
                <div className="text-[11px] font-extrabold text-muted mb-2.5 tracking-wide">
                  CANDIDATOS COMPATIBLES
                </div>
                {disponibles.map((c) => (
                  <div key={c.id} className="py-2 border-b border-border flex justify-between items-center">
                    <div>
                      <div className="font-bold text-text text-[13px]">{c.nombre}</div>
                      <div className="text-muted text-[11px]">{c.experiencia}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        startTransition(async () => agregarCandidato(vAct.id, c.id))
                      }
                    >
                      + Agregar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {showForm && (
        <Modal title="Publicar Nueva Vacante" onClose={() => setShowForm(false)}>
          <form action={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Field label="Empresa">
              <Select name="empresaId" required defaultValue="">
                <option value="" disabled>Seleccionar...</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </Select>
            </Field>
            <Field label="Puesto"><Input name="puesto" placeholder="Ej: Promotor de Ventas" required /></Field>
            <Field label="Sector">
              <Select name="sector" required defaultValue="">
                <option value="" disabled>Seleccionar...</option>
                {Object.entries(SECTOR_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </Field>
            <Field label="Temporada">
              <Select name="temporada" required defaultValue="">
                <option value="" disabled>Seleccionar...</option>
                {Object.entries(TEMPORADA_INFO).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Ciudad"><Input name="ciudad" placeholder="Ej: Tuxtla Gutiérrez" required /></Field>
            <Field label="No. Plazas"><Input name="plazas" type="number" min={1} required /></Field>
            <div className="md:col-span-2">
              <Field label="Salario mensual ($)"><Input name="salario" type="number" placeholder="Ej: 6500" required /></Field>
            </div>
            <div className="md:col-span-2 flex gap-2.5 mt-1">
              <Button type="submit" disabled={pending}>{pending ? "Publicando..." : "Publicar"}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
