"use client";

import { useState, useTransition } from "react";
import { Card, Field, Input, Button } from "@/components/ui";
import { SECTOR_LABEL } from "@/lib/dominio";
import { editarMiPerfil } from "../actions";
import { User, CheckCircle2 } from "lucide-react";

type Candidato = {
  nombre: string;
  edad: number | null;
  ciudad: string | null;
  telefono: string | null;
  email: string | null;
  experiencia: string | null;
  sectores: string[];
  disponibilidad: string | null;
  salarioEsperado: number | null;
};

export function CandidatoPerfilForm({ candidato }: { candidato: Candidato }) {
  const [sectoresSel, setSectoresSel] = useState<string[]>(candidato.sectores);
  const [pending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  function onSubmit(formData: FormData) {
    setGuardado(false);
    sectoresSel.forEach((s) => formData.append("sectores", s));
    startTransition(async () => {
      await editarMiPerfil(formData);
      setGuardado(true);
    });
  }

  return (
    <Card className="mb-5">
      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">
        <User size={13} />
        MI PERFIL
      </div>
      <form action={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <Field label="Nombre completo"><Input name="nombre" defaultValue={candidato.nombre} required /></Field>
        <Field label="Edad"><Input name="edad" type="number" defaultValue={candidato.edad ?? undefined} /></Field>
        <Field label="Ciudad"><Input name="ciudad" defaultValue={candidato.ciudad ?? undefined} /></Field>
        <Field label="Teléfono"><Input name="telefono" defaultValue={candidato.telefono ?? undefined} /></Field>
        <div className="md:col-span-2">
          <Field label="Correo"><Input name="email" type="email" defaultValue={candidato.email ?? undefined} /></Field>
        </div>
        <Field label="Disponibilidad"><Input name="disponibilidad" defaultValue={candidato.disponibilidad ?? undefined} /></Field>
        <Field label="Salario esperado ($)"><Input name="salarioEsperado" type="number" defaultValue={candidato.salarioEsperado ?? undefined} /></Field>
        <div className="md:col-span-2">
          <Field label="Experiencia"><Input name="experiencia" defaultValue={candidato.experiencia ?? undefined} /></Field>
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
        {guardado && (
          <div className="md:col-span-2 flex items-center gap-1.5 text-xs font-semibold text-green bg-green/10 rounded-lg px-3 py-2.5">
            <CheckCircle2 size={14} />
            Perfil actualizado correctamente.
          </div>
        )}
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar cambios"}</Button>
        </div>
      </form>
    </Card>
  );
}
