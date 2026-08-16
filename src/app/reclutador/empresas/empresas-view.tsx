"use client";

import { useState, useTransition } from "react";
import { Card, Badge, Button, Modal, Field, Input, Select } from "@/components/ui";
import { SECTOR_LABEL, TEMPORADA_INFO } from "@/lib/dominio";
import { crearEmpresa, eliminarEmpresa } from "./actions";

type Empresa = {
  id: string;
  nombre: string;
  sector: string;
  ciudad: string;
  contacto: string | null;
  email: string | null;
  telefono: string | null;
  temporadaPrincipal: string | null;
  _count: { vacantes: number };
};

export function EmpresasView({ empresas }: { empresas: Empresa[] }) {
  const [showForm, setShowForm] = useState(false);
  const [detalle, setDetalle] = useState<Empresa | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await crearEmpresa(formData);
      setShowForm(false);
    });
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-navy">Empresas</h2>
          <p className="text-muted text-sm mt-0.5">{empresas.length} registrada(s)</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Registrar Empresa</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {empresas.map((e) => {
          const t = e.temporadaPrincipal ? TEMPORADA_INFO[e.temporadaPrincipal] : null;
          return (
            <Card key={e.id} className="cursor-pointer" >
              <div onClick={() => setDetalle(e)}>
                <div className="flex justify-between items-start">
                  <div className="font-extrabold text-navy text-[15px]">{e.nombre}</div>
                  <span
                    className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold"
                    style={{ color: t?.color ?? "#8892A4", background: t?.bg ?? "#F5F5F5" }}
                  >
                    {SECTOR_LABEL[e.sector]}
                  </span>
                </div>
                <div className="text-muted text-xs mt-1">📍 {e.ciudad}</div>
                <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                  <div>
                    {e.contacto && <div className="text-xs text-muted">👤 {e.contacto}</div>}
                    {e.email && <div className="text-xs text-muted mt-0.5">✉️ {e.email}</div>}
                  </div>
                  <span className="text-[11px] text-muted">{e._count.vacantes} vacante(s)</span>
                </div>
              </div>
            </Card>
          );
        })}
        {empresas.length === 0 && (
          <div className="text-muted text-sm col-span-2 text-center py-8">
            Sin empresas registradas todavía
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Registrar Nueva Empresa" onClose={() => setShowForm(false)}>
          <form action={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Field label="Nombre">
              <Input name="nombre" required />
            </Field>
            <Field label="Sector">
              <Select name="sector" required defaultValue="">
                <option value="" disabled>Seleccionar...</option>
                {Object.entries(SECTOR_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </Field>
            <Field label="Ciudad">
              <Input name="ciudad" placeholder="Ej: Tuxtla Gutiérrez" required />
            </Field>
            <Field label="Temporada principal">
              <Select name="temporadaPrincipal" defaultValue="">
                <option value="">Seleccionar...</option>
                {Object.entries(TEMPORADA_INFO).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Contacto">
              <Input name="contacto" />
            </Field>
            <Field label="Teléfono">
              <Input name="telefono" placeholder="9610000000" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Correo">
                <Input name="email" type="email" placeholder="contacto@empresa.mx" />
              </Field>
            </div>
            <div className="md:col-span-2 flex gap-2.5 mt-1">
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {detalle && (
        <Modal title={detalle.nombre} onClose={() => setDetalle(null)}>
          <div className="flex gap-2 mb-3.5">
            <Badge>{SECTOR_LABEL[detalle.sector]}</Badge>
          </div>
          {[
            ["📍", "Ciudad", detalle.ciudad],
            ["👤", "Contacto", detalle.contacto],
            ["✉️", "Correo", detalle.email],
            ["📞", "Teléfono", detalle.telefono],
          ].map(([icon, label, value]) =>
            value ? (
              <div key={label} className="py-2.5 border-b border-border">
                <span className="text-muted text-xs mr-2">{icon} {label}</span>
                <span className="font-semibold text-sm">{value}</span>
              </div>
            ) : null
          )}
          <div className="mt-4 flex justify-end">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                startTransition(async () => {
                  await eliminarEmpresa(detalle.id);
                  setDetalle(null);
                });
              }}
            >
              🗑️ Eliminar empresa
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
