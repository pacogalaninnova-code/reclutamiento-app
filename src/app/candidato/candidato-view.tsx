"use client";

import { useRef, useTransition } from "react";
import { Card, Badge, Button } from "@/components/ui";
import { DOCUMENTOS, ETAPA_LABEL, ETAPA_COLOR, docPct, fmt } from "@/lib/dominio";
import { subirMiDocumento, quitarMiDocumento } from "./actions";

type Documento = { tipo: string; estado: string; nombreArchivo: string | null; url: string | null };
type Aplicacion = {
  etapa: string;
  vacante: { puesto: string; salario: number; empresa: { nombre: string } };
};
type Candidato = {
  nombre: string;
  estado: string;
  documentos: Documento[];
  aplicaciones: Aplicacion[];
};

export function CandidatoView({ candidato }: { candidato: Candidato }) {
  const [, startTransition] = useTransition();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function docInfo(tipo: string): Documento {
    return (
      candidato.documentos.find((d) => d.tipo === tipo) ?? {
        tipo,
        estado: "PENDIENTE",
        nombreArchivo: null,
        url: null,
      }
    );
  }

  const pct = docPct(candidato.documentos);

  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-navy to-navy-dark rounded-2xl px-6 py-5 mb-5">
        <div className="text-white/40 text-[10px] font-bold tracking-widest mb-1">
          BIENVENIDO/A
        </div>
        <div className="text-white text-xl font-extrabold">{candidato.nombre}</div>
        <div className="mt-2">
          <Badge estado={candidato.estado}>{candidato.estado}</Badge>
        </div>
      </div>

      <Card className="mb-5">
        <div className="text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">
          📋 MIS PROCESOS
        </div>
        {candidato.aplicaciones.length === 0 && (
          <div className="text-muted text-sm text-center py-4">
            Aún no estás en proceso para ninguna vacante
          </div>
        )}
        {candidato.aplicaciones.map((a, i) => (
          <div key={i} className="py-3 border-b border-border last:border-0">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-navy text-[13px]">{a.vacante.puesto}</div>
                <div className="text-muted text-[11px] mt-0.5">{a.vacante.empresa.nombre}</div>
              </div>
              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${ETAPA_COLOR[a.etapa]}`}>
                {ETAPA_LABEL[a.etapa]}
              </span>
            </div>
            <div className="text-coral font-bold text-sm mt-1">{fmt(a.vacante.salario)}/mes</div>
          </div>
        ))}
      </Card>

      <Card>
        <div className="text-[11px] font-extrabold text-navy mb-3 tracking-wide">
          📁 MIS DOCUMENTOS
        </div>
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-muted">Completitud</span>
            <span className={`font-extrabold ${pct === 100 ? "text-green" : "text-gold"}`}>{pct}%</span>
          </div>
          <div className="bg-border rounded h-1.5">
            <div
              className={`h-1.5 rounded ${pct === 100 ? "bg-green" : "bg-gold"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {DOCUMENTOS.map((doc) => {
          const info = docInfo(doc.key);
          const adjunto = info.estado === "ADJUNTO";
          return (
            <div key={doc.key} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div>
                <span className="text-[13px]">{doc.icon} </span>
                <span className={`text-xs font-semibold ${adjunto ? "text-green" : "text-text"}`}>
                  {doc.label}
                </span>
                {info.nombreArchivo && (
                  <div className="text-[10px] text-muted mt-0.5">📎 {info.nombreArchivo}</div>
                )}
              </div>
              <div className="flex gap-1.5 items-center">
                <input
                  ref={(el) => {
                    fileRefs.current[doc.key] = el;
                  }}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("archivo", file);
                    startTransition(async () => subirMiDocumento(doc.key, fd));
                  }}
                />
                <Button
                  size="sm"
                  variant={adjunto ? "primary" : "ghost"}
                  onClick={() => {
                    if (!adjunto) fileRefs.current[doc.key]?.click();
                    else startTransition(async () => quitarMiDocumento(doc.key));
                  }}
                >
                  {adjunto ? "✅ Adjunto" : "+ Subir"}
                </Button>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
