"use client";

import { useRef, useState, useTransition } from "react";
import { Card, Badge, Button, Modal, Field, Input } from "@/components/ui";
import { SECTOR_LABEL, DOCUMENTOS, fmt, docPct } from "@/lib/dominio";
import { crearCandidato, editarCandidato, eliminarCandidato, subirDocumento, quitarDocumento } from "./actions";

type Documento = { tipo: string; estado: string; nombreArchivo: string | null; url: string | null };
type Candidato = {
  id: string;
  nombre: string;
  edad: number | null;
  ciudad: string | null;
  telefono: string | null;
  email: string | null;
  experiencia: string | null;
  sectores: string[];
  disponibilidad: string | null;
  salarioEsperado: number | null;
  estado: string;
  documentos: Documento[];
};

function CandidatoFormModal({
  titulo,
  candidato,
  onGuardar,
  onClose,
}: {
  titulo: string;
  candidato?: Candidato;
  onGuardar: (formData: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const [sectoresSel, setSectoresSel] = useState<string[]>(candidato?.sectores ?? []);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    sectoresSel.forEach((s) => formData.append("sectores", s));
    startTransition(async () => {
      await onGuardar(formData);
    });
  }

  return (
    <Modal title={titulo} onClose={onClose} wide>
      <form action={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <Field label="Nombre completo"><Input name="nombre" defaultValue={candidato?.nombre} required /></Field>
        <Field label="Edad"><Input name="edad" type="number" defaultValue={candidato?.edad ?? undefined} /></Field>
        <Field label="Ciudad"><Input name="ciudad" placeholder="Ej: Tuxtla Gutiérrez" defaultValue={candidato?.ciudad ?? undefined} /></Field>
        <Field label="Teléfono"><Input name="telefono" placeholder="9610000000" defaultValue={candidato?.telefono ?? undefined} /></Field>
        <div className="md:col-span-2">
          <Field label="Correo"><Input name="email" type="email" placeholder="nombre@gmail.com" defaultValue={candidato?.email ?? undefined} /></Field>
        </div>
        <Field label="Disponibilidad"><Input name="disponibilidad" placeholder="Inmediata / Mar 2026" defaultValue={candidato?.disponibilidad ?? undefined} /></Field>
        <Field label="Salario esperado ($)"><Input name="salarioEsperado" type="number" placeholder="6500" defaultValue={candidato?.salarioEsperado ?? undefined} /></Field>
        <div className="md:col-span-2">
          <Field label="Experiencia"><Input name="experiencia" placeholder="Breve descripción" defaultValue={candidato?.experiencia ?? undefined} /></Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Sectores de interés">
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Object.entries(SECTOR_LABEL).map(([k, v]) => {
                const active = sectoresSel.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() =>
                      setSectoresSel((prev) =>
                        active ? prev.filter((s) => s !== k) : [...prev, k]
                      )
                    }
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border ${
                      active ? "bg-navy text-white border-navy" : "bg-white text-text border-border"
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
        <div className="md:col-span-2 flex gap-2.5 mt-1">
          <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar"}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </Modal>
  );
}

export function CandidatosView({ candidatos }: { candidatos: Candidato[] }) {
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState<"Todos" | "DISPONIBLE" | "CONTRATADO">("Todos");
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const lista = filtro === "Todos" ? candidatos : candidatos.filter((c) => c.estado === filtro);
  const detalle = candidatos.find((c) => c.id === detalleId) ?? null;
  const editando = candidatos.find((c) => c.id === editandoId) ?? null;

  function docInfo(c: Candidato, tipo: string): Documento {
    return c.documentos.find((d) => d.tipo === tipo) ?? { tipo, estado: "PENDIENTE", nombreArchivo: null, url: null };
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-navy">Candidatos</h2>
          <p className="text-muted text-sm mt-0.5">
            {candidatos.filter((c) => c.estado === "DISPONIBLE").length} disponibles ·{" "}
            {candidatos.filter((c) => c.estado === "CONTRATADO").length} contratados
          </p>
        </div>
        <div className="flex gap-2">
          {(["Todos", "DISPONIBLE", "CONTRATADO"] as const).map((x) => (
            <Button
              key={x}
              size="sm"
              variant={filtro === x ? "secondary" : "ghost"}
              onClick={() => setFiltro(x)}
            >
              {x === "Todos" ? "Todos" : x === "DISPONIBLE" ? "Disponible" : "Contratado"}
            </Button>
          ))}
          <Button onClick={() => setShowForm(true)}>+ Registrar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {lista.map((c) => {
          const pct = docPct(c.documentos);
          return (
            <Card key={c.id} className="cursor-pointer" >
              <div onClick={() => setDetalleId(c.id)}>
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-coral flex items-center justify-center text-white font-extrabold text-lg">
                    {c.nombre.charAt(0)}
                  </div>
                  <Badge estado={c.estado}>{c.estado}</Badge>
                </div>
                <div className="font-extrabold text-navy text-[15px] mt-2.5">{c.nombre}</div>
                <div className="text-muted text-xs mt-0.5">
                  {c.edad ? `${c.edad} años · ` : ""}📍 {c.ciudad ?? "-"}
                </div>
                {c.experiencia && (
                  <div className="text-text text-xs mt-1.5 leading-relaxed">{c.experiencia}</div>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.sectores.map((s) => (
                    <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream border border-border">
                      {SECTOR_LABEL[s]}
                    </span>
                  ))}
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-border">
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-muted">📁 Documentos</span>
                    <span className={`text-[11px] font-bold ${pct === 100 ? "text-green" : pct > 0 ? "text-gold" : "text-muted"}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="bg-border rounded h-1">
                    <div
                      className={`h-1 rounded ${pct === 100 ? "bg-green" : "bg-gold"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {lista.length === 0 && (
          <div className="text-muted text-sm col-span-3 text-center py-8">Sin candidatos en esta vista</div>
        )}
      </div>

      {showForm && (
        <CandidatoFormModal
          titulo="Registrar Candidato"
          onGuardar={async (fd) => {
            await crearCandidato(fd);
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {editando && (
        <CandidatoFormModal
          titulo={`Editar: ${editando.nombre}`}
          candidato={editando}
          onGuardar={async (fd) => {
            await editarCandidato(editando.id, fd);
            setEditandoId(null);
          }}
          onClose={() => setEditandoId(null)}
        />
      )}

      {detalle && (
        <Modal title={detalle.nombre} onClose={() => setDetalleId(null)} wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            <div>
              <div className="flex gap-2 mb-3.5 flex-wrap">
                <Badge estado={detalle.estado}>{detalle.estado}</Badge>
                {detalle.sectores.map((s) => (
                  <Badge key={s}>{SECTOR_LABEL[s]}</Badge>
                ))}
              </div>
              {[
                ["📍", "Ciudad", detalle.ciudad],
                ["🎂", "Edad", detalle.edad ? `${detalle.edad} años` : null],
                ["📞", "Teléfono", detalle.telefono],
                ["✉️", "Correo", detalle.email],
                ["💼", "Experiencia", detalle.experiencia],
                ["🕐", "Disponibilidad", detalle.disponibilidad],
                ["💰", "Salario esp.", detalle.salarioEsperado ? fmt(detalle.salarioEsperado) + "/mes" : null],
              ].map(([icon, label, value]) =>
                value ? (
                  <div key={label} className="py-2 border-b border-border">
                    <span className="text-muted text-[11px] mr-2">{icon} {label}</span>
                    <span className="font-semibold text-[13px]">{value}</span>
                  </div>
                ) : null
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditandoId(detalle.id);
                    setDetalleId(null);
                  }}
                >
                  ✏️ Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    startTransition(async () => {
                      await eliminarCandidato(detalle.id);
                      setDetalleId(null);
                    });
                  }}
                >
                  🗑️ Eliminar candidato
                </Button>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-extrabold text-navy mb-3 tracking-wide">📁 DOCUMENTOS</div>
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted">Completitud</span>
                  <span className={`font-extrabold ${docPct(detalle.documentos) === 100 ? "text-green" : "text-gold"}`}>
                    {docPct(detalle.documentos)}%
                  </span>
                </div>
                <div className="bg-border rounded h-1.5">
                  <div
                    className={`h-1.5 rounded ${docPct(detalle.documentos) === 100 ? "bg-green" : "bg-gold"}`}
                    style={{ width: `${docPct(detalle.documentos)}%` }}
                  />
                </div>
              </div>
              {DOCUMENTOS.map((doc) => {
                const info = docInfo(detalle, doc.key);
                const adjunto = info.estado === "ADJUNTO";
                const refKey = `${detalle.id}-${doc.key}`;
                return (
                  <div key={doc.key} className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <span className="text-[13px]">{doc.icon} </span>
                      <span className={`text-xs font-semibold ${adjunto ? "text-green" : "text-text"}`}>
                        {doc.label}
                      </span>
                      {info.url && (
                        <div className="text-[10px] text-muted mt-0.5">
                          <a href={info.url} target="_blank" rel="noreferrer" className="underline">
                            📎 {info.nombreArchivo}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <input
                        ref={(el) => {
                          fileRefs.current[refKey] = el;
                        }}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("archivo", file);
                          startTransition(async () => {
                            await subirDocumento(detalle.id, doc.key, fd);
                          });
                        }}
                      />
                      <Button
                        size="sm"
                        variant={adjunto ? "primary" : "ghost"}
                        onClick={() => {
                          if (!adjunto) fileRefs.current[refKey]?.click();
                          else startTransition(async () => quitarDocumento(detalle.id, doc.key));
                        }}
                      >
                        {adjunto ? "✅ Adjunto" : "+ Adjuntar"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
