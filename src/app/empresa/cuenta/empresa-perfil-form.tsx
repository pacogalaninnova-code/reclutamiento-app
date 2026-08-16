"use client";

import { useState, useTransition } from "react";
import { Card, Field, Input, Select, Button } from "@/components/ui";
import { SECTOR_LABEL } from "@/lib/dominio";
import { editarMiEmpresa } from "../actions";
import { Building2, CheckCircle2 } from "lucide-react";

type Empresa = {
  nombre: string;
  sector: string;
  ciudad: string;
  contacto: string | null;
  email: string | null;
  telefono: string | null;
};

export function EmpresaPerfilForm({ empresa }: { empresa: Empresa }) {
  const [pending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  function onSubmit(formData: FormData) {
    setGuardado(false);
    startTransition(async () => {
      await editarMiEmpresa(formData);
      setGuardado(true);
    });
  }

  return (
    <Card className="max-w-lg mb-5">
      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">
        <Building2 size={13} />
        DATOS DE LA EMPRESA
      </div>
      <form action={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="md:col-span-2">
          <Field label="Nombre"><Input name="nombre" defaultValue={empresa.nombre} required /></Field>
        </div>
        <Field label="Sector">
          <Select name="sector" required defaultValue={empresa.sector}>
            {Object.entries(SECTOR_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>
        <Field label="Ciudad"><Input name="ciudad" defaultValue={empresa.ciudad} required /></Field>
        <Field label="Contacto"><Input name="contacto" defaultValue={empresa.contacto ?? undefined} /></Field>
        <Field label="Teléfono"><Input name="telefono" defaultValue={empresa.telefono ?? undefined} /></Field>
        <div className="md:col-span-2">
          <Field label="Correo"><Input name="email" type="email" defaultValue={empresa.email ?? undefined} /></Field>
        </div>
        {guardado && (
          <div className="md:col-span-2 flex items-center gap-1.5 text-xs font-semibold text-green bg-green/10 rounded-lg px-3 py-2.5">
            <CheckCircle2 size={14} />
            Datos actualizados correctamente.
          </div>
        )}
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar cambios"}</Button>
        </div>
      </form>
    </Card>
  );
}
