"use client";

import { useState, useTransition } from "react";
import { Card, Button, Field, Input, Select } from "@/components/ui";
import { crearUsuario, eliminarUsuario, eliminarRegistro } from "./actions";

type Item = { id: string; nombre: string; sub: string };

export function ConfiguracionView({
  usuarios,
  empresas,
  vacantes,
  candidatos,
  esAdmin,
}: {
  usuarios: Item[];
  empresas: Item[];
  vacantes: Item[];
  candidatos: Item[];
  esAdmin: boolean;
}) {
  const [tab, setTab] = useState<"usuarios" | "empresas" | "vacantes" | "candidatos">("usuarios");
  const [showNew, setShowNew] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const TABS: { key: typeof tab; icon: string; label: string; items: Item[] }[] = [
    { key: "usuarios", icon: "👤", label: "Usuarios", items: usuarios },
    { key: "empresas", icon: "🏢", label: "Empresas", items: empresas },
    { key: "vacantes", icon: "📋", label: "Vacantes", items: vacantes },
    { key: "candidatos", icon: "👥", label: "Candidatos", items: candidatos },
  ];
  const actual = TABS.find((t) => t.key === tab)!;

  function eliminar(id: string) {
    startTransition(async () => {
      if (tab === "usuarios") await eliminarUsuario(id);
      else await eliminarRegistro(tab.slice(0, -1) as "empresa" | "vacante" | "candidato", id);
      setConfirmId(null);
    });
  }

  function onSubmitUsuario(formData: FormData) {
    startTransition(async () => {
      await crearUsuario(formData);
      setShowNew(false);
    });
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-extrabold text-navy mb-5">⚙️ Configuración</h2>
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? "secondary" : "ghost"}
            onClick={() => {
              setTab(t.key);
              setShowNew(false);
            }}
          >
            {t.icon} {t.label}
          </Button>
        ))}
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="text-xs font-extrabold text-navy tracking-wide">
            {actual.label.toUpperCase()} ({actual.items.length})
          </div>
          {tab === "usuarios" && esAdmin && (
            <Button size="sm" onClick={() => setShowNew(true)}>+ Nuevo Usuario</Button>
          )}
        </div>

        {showNew && tab === "usuarios" && (
          <div className="bg-cream rounded-xl p-4 mb-4">
            <div className="text-[11px] font-extrabold text-coral mb-3">NUEVO USUARIO</div>
            <form action={onSubmitUsuario} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nombre"><Input name="nombre" required /></Field>
              <Field label="Rol">
                <Select name="rol" defaultValue="RECLUTADOR">
                  <option value="ADMIN">Admin</option>
                  <option value="RECLUTADOR">Reclutador</option>
                </Select>
              </Field>
              <Field label="Correo"><Input name="email" type="email" required /></Field>
              <Field label="Contraseña"><Input name="password" type="password" required minLength={6} /></Field>
              <div className="md:col-span-2 flex gap-2 mt-1">
                <Button type="submit" disabled={pending}>Guardar</Button>
                <Button type="button" variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        )}

        {actual.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
            <div>
              <div className="font-bold text-text text-[13px]">{item.nombre}</div>
              <div className="text-muted text-[11px] mt-0.5">{item.sub}</div>
            </div>
            {confirmId === item.id ? (
              <div className="flex gap-1.5 items-center">
                <span className="text-xs text-red font-semibold">¿Confirmar?</span>
                <Button size="sm" variant="danger" onClick={() => eliminar(item.id)}>Sí, eliminar</Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>Cancelar</Button>
              </div>
            ) : (
              (tab !== "usuarios" || esAdmin) && (
                <Button size="sm" variant="danger" onClick={() => setConfirmId(item.id)}>🗑️ Eliminar</Button>
              )
            )}
          </div>
        ))}
        {actual.items.length === 0 && (
          <div className="text-muted text-center py-5 text-sm">Sin registros en esta sección</div>
        )}
      </Card>
    </div>
  );
}
