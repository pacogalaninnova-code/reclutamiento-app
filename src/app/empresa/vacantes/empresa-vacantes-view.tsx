"use client";

import { useState, useTransition } from "react";
import { Card, Badge, Button, Modal, Field, Input, Select, Termometro } from "@/components/ui";
import { SECTOR_LABEL, TEMPORADA_INFO, ETAPA_LABEL, ETAPA_COLOR, fmt } from "@/lib/dominio";
import { solicitarVacante } from "./actions";

type Vacante = {
  id: string;
  puesto: string;
  sector: string;
  ciudad: string;
  plazas: number;
  salario: number;
  temporada: string;
  estado: string;
  aplicaciones: {
    etapa: string;
    termometro: number;
    candidato: { nombre: string };
  }[];
};

export function EmpresaVacantesView({ vacantes }: { vacantes: Vacante[] }) {
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await solicitarVacante(formData);
      setShowForm(false);
    });
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-navy">Mis Vacantes</h2>
          <p className="text-muted text-sm mt-0.5">{vacantes.length} publicada(s)</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Solicitar Vacante</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {vacantes.map((v) => {
          const t = TEMPORADA_INFO[v.temporada];
          return (
            <Card key={v.id}>
              <div className="flex justify-between items-center">
                <Badge estado={v.estado}>{v.estado}</Badge>
                <span className="text-lg">{t.icono}</span>
              </div>
              <div className="font-extrabold text-navy text-[15px] mt-2.5">{v.puesto}</div>
              <div className="text-muted text-xs mt-0.5">
                📍 {v.ciudad} · {v.plazas} plaza(s) · {SECTOR_LABEL[v.sector]}
              </div>
              <div className="font-bold text-coral text-sm mt-1.5">
                {fmt(v.salario)}<span className="text-muted font-normal">/mes</span>
              </div>

              {v.aplicaciones.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-[11px] font-extrabold text-muted mb-2">CANDIDATOS EN PROCESO</div>
                  {v.aplicaciones.map((a, i) => (
                    <div key={i} className="py-2 border-b border-border last:border-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-semibold text-[13px]">{a.candidato.nombre}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${ETAPA_COLOR[a.etapa]}`}>
                          {ETAPA_LABEL[a.etapa]}
                        </span>
                      </div>
                      <Termometro value={a.termometro} readonly />
                    </div>
                  ))}
                </div>
              )}
              {v.aplicaciones.length === 0 && (
                <div className="mt-3 pt-3 border-t border-border text-muted text-xs">
                  Aún sin candidatos en proceso
                </div>
              )}
            </Card>
          );
        })}
        {vacantes.length === 0 && (
          <div className="text-muted text-sm col-span-2 text-center py-8">
            Aún no has publicado vacantes
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Solicitar Nueva Vacante" onClose={() => setShowForm(false)}>
          <form action={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
            <Field label="Ciudad"><Input name="ciudad" required /></Field>
            <Field label="No. Plazas"><Input name="plazas" type="number" min={1} required /></Field>
            <Field label="Salario mensual ($)"><Input name="salario" type="number" required /></Field>
            <div className="md:col-span-2 flex gap-2.5 mt-1">
              <Button type="submit" disabled={pending}>{pending ? "Enviando..." : "Solicitar"}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
