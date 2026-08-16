"use client";

import { useState, useTransition } from "react";
import { Card, Badge, Button, Modal, Field, Input, Select, Termometro } from "@/components/ui";
import {
  SECTOR_LABEL,
  TEMPORADA_INFO,
  TIPO_CONTRATO_LABEL,
  ETAPA_LABEL,
  ETAPA_COLOR,
  fmt,
  comision,
  siguienteEtapa,
} from "@/lib/dominio";
import { APP_NAME } from "@/lib/marca";
import {
  crearVacante,
  editarVacante,
  agregarCandidato,
  avanzarEtapa,
  setTermometro,
  aprobarVacante,
  rechazarVacante,
} from "./actions";
import { Pencil, MapPin, Building2, CheckCircle2, XCircle, Workflow, Wallet, MessageCircle } from "lucide-react";

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
  empresaId: string;
  plazas: number;
  salario: number;
  tipoContrato: string;
  temporada: string | null;
  estado: string;
  empresa: Empresa;
  aplicaciones: Aplicacion[];
};
type Candidato = { id: string; nombre: string; experiencia: string | null; sectores: string[]; estado: string };

function VacanteFormModal({
  titulo,
  vacante,
  empresas,
  onGuardar,
  onClose,
}: {
  titulo: string;
  vacante?: Vacante;
  empresas: Empresa[];
  onGuardar: (formData: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [tipoContrato, setTipoContrato] = useState(vacante?.tipoContrato ?? "PERMANENTE");

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await onGuardar(formData);
    });
  }

  return (
    <Modal title={titulo} onClose={onClose}>
      <form action={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <Field label="Empresa">
          <Select name="empresaId" required defaultValue={vacante?.empresaId ?? ""}>
            <option value="" disabled>Seleccionar...</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </Select>
        </Field>
        <Field label="Puesto"><Input name="puesto" placeholder="Ej: Analista de Ventas" defaultValue={vacante?.puesto} required /></Field>
        <Field label="Sector">
          <Select name="sector" required defaultValue={vacante?.sector ?? ""}>
            <option value="" disabled>Seleccionar...</option>
            {Object.entries(SECTOR_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo de contrato">
          <Select
            name="tipoContrato"
            required
            value={tipoContrato}
            onChange={(e) => setTipoContrato(e.target.value)}
          >
            {Object.entries(TIPO_CONTRATO_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>
        {tipoContrato === "TEMPORAL" && (
          <Field label="Temporada">
            <Select name="temporada" required defaultValue={vacante?.temporada ?? ""}>
              <option value="" disabled>Seleccionar...</option>
              {Object.entries(TEMPORADA_INFO).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Ciudad"><Input name="ciudad" placeholder="Ej: Tuxtla Gutiérrez" defaultValue={vacante?.ciudad} required /></Field>
        <Field label="No. Plazas"><Input name="plazas" type="number" min={1} defaultValue={vacante?.plazas} required /></Field>
        <div className="md:col-span-2">
          <Field label="Salario mensual ($)"><Input name="salario" type="number" placeholder="Ej: 6500" defaultValue={vacante?.salario} required /></Field>
        </div>
        <div className="md:col-span-2 flex gap-2.5 mt-1">
          <Button type="submit" disabled={pending}>{pending ? "Guardando..." : vacante ? "Guardar cambios" : "Publicar"}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </Modal>
  );
}

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
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [procId, setProcId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const vAct = vacantes.find((v) => v.id === procId) ?? null;
  const editando = vacantes.find((v) => v.id === editandoId) ?? null;
  const disponibles = vAct
    ? candidatos.filter(
        (c) =>
          c.estado !== "CONTRATADO" &&
          c.sectores.includes(vAct.sector) &&
          !vAct.aplicaciones.some((a) => a.candidatoId === c.id)
      )
    : [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-navy">Vacantes</h2>
          <p className="text-muted text-sm mt-0.5">
            {vacantes.filter((v) => v.estado === "ACTIVA").length} activas ·{" "}
            {vacantes.filter((v) => v.estado === "CUBIERTA").length} cubiertas
            {vacantes.some((v) => v.estado === "PENDIENTE") && (
              <>
                {" "}
                ·{" "}
                <span className="text-highlight font-bold">
                  {vacantes.filter((v) => v.estado === "PENDIENTE").length} por aprobar
                </span>
              </>
            )}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Publicar Vacante</Button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${procId ? "lg:grid-cols-[1fr_1fr_1.1fr]" : "lg:grid-cols-3"} gap-3.5`}>
        {vacantes.map((v) => {
          const t = v.temporada ? TEMPORADA_INFO[v.temporada] : null;
          const contratados = v.aplicaciones.filter((a) => a.etapa === "CONTRATADO").length;
          const sel = v.id === procId;
          const esPendiente = v.estado === "PENDIENTE";
          return (
            <Card
              key={v.id}
              className={`${esPendiente ? "" : "cursor-pointer"} ${sel ? "!border-accent !border-2" : ""}`}
              >
              <div onClick={() => !esPendiente && setProcId(sel ? null : v.id)}>
                <div className="flex justify-between items-center">
                  <Badge estado={v.estado}>{v.estado}</Badge>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditandoId(v.id);
                    }}
                    className="text-muted hover:text-accent"
                    title="Editar vacante"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <div className="font-extrabold text-navy text-[15px] mt-2.5">{v.puesto}</div>
                <div className="flex items-center gap-1 text-muted text-xs mt-0.5">
                  <MapPin size={11} />
                  {v.ciudad} · {v.plazas} plaza(s)
                </div>
                <div className="flex items-center gap-1 text-muted text-xs mt-0.5">
                  <Building2 size={11} />
                  {v.empresa.nombre}
                </div>
                <div className="font-bold text-accent text-sm mt-1.5">
                  {fmt(v.salario)}<span className="text-muted font-normal">/mes</span>
                </div>
                <div className="mt-1.5">
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
                </div>
                {!esPendiente && (
                  <div className="bg-canvas rounded-lg px-2.5 py-1.5 mt-2.5 flex justify-between items-center">
                    <span className="text-[11px] text-muted">Comisión est.</span>
                    <span className="text-xs font-extrabold text-highlight">{fmt(contratados * comision(v.salario))}</span>
                  </div>
                )}
                {!esPendiente && (
                  <div className="mt-2 text-[11px] text-accent font-bold text-right">Ver proceso →</div>
                )}
              </div>
              {esPendiente && (
                <div className="mt-3 pt-3 border-t border-border flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => startTransition(async () => aprobarVacante(v.id))}
                  >
                    <CheckCircle2 size={13} />
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => startTransition(async () => rechazarVacante(v.id))}
                  >
                    <XCircle size={13} />
                    Rechazar
                  </Button>
                </div>
              )}
            </Card>
          );
        })}

        {vAct && (
          <Card className="!border-accent/30 !border-2 overflow-y-auto max-h-[600px]">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-accent mb-1 tracking-wide">
              <Workflow size={13} />
              PROCESO · {vAct.puesto}
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
                      <span className="flex items-center gap-1 text-[11px] text-highlight font-bold">
                        <Wallet size={12} />
                        Com. {fmt(comision(vAct.salario))}
                      </span>
                    )}
                    {a.candidato.telefono && (
                      <a
                        href={`https://wa.me/52${a.candidato.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hola ${a.candidato.nombre}, te contactamos de ${APP_NAME} sobre tu proceso: ${ETAPA_LABEL[a.etapa]}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-border text-muted"
                      >
                        <MessageCircle size={12} />
                        WhatsApp
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
        <VacanteFormModal
          titulo="Publicar Nueva Vacante"
          empresas={empresas}
          onGuardar={async (fd) => {
            await crearVacante(fd);
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {editando && (
        <VacanteFormModal
          titulo={`Editar: ${editando.puesto}`}
          vacante={editando}
          empresas={empresas}
          onGuardar={async (fd) => {
            await editarVacante(editando.id, fd);
            setEditandoId(null);
          }}
          onClose={() => setEditandoId(null)}
        />
      )}
    </div>
  );
}
