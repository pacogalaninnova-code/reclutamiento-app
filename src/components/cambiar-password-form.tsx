"use client";

import { useState, useTransition } from "react";
import { Card, Field, Input, Button } from "@/components/ui";
import { cambiarPassword } from "@/lib/cuenta-actions";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

export function CambiarPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  function onSubmit(formData: FormData) {
    setMensaje(null);
    startTransition(async () => {
      const res = await cambiarPassword(formData);
      if (res.ok) {
        setMensaje({ tipo: "ok", texto: "Contraseña actualizada correctamente." });
        (document.getElementById("form-password") as HTMLFormElement)?.reset();
      } else {
        setMensaje({ tipo: "error", texto: res.error });
      }
    });
  }

  return (
    <Card className="max-w-md">
      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-navy mb-3.5 tracking-wide">
        <Lock size={13} />
        CAMBIAR CONTRASEÑA
      </div>
      <form id="form-password" action={onSubmit} className="flex flex-col gap-3.5">
        <Field label="Contraseña actual">
          <Input name="passwordActual" type="password" required />
        </Field>
        <Field label="Nueva contraseña">
          <Input name="passwordNueva" type="password" required minLength={6} />
        </Field>
        <Field label="Confirmar nueva contraseña">
          <Input name="passwordConfirmar" type="password" required minLength={6} />
        </Field>
        {mensaje && (
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2.5 ${
              mensaje.tipo === "ok" ? "text-green bg-green/10" : "text-red bg-red/10"
            }`}
          >
            {mensaje.tipo === "ok" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {mensaje.texto}
          </div>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Actualizar contraseña"}
        </Button>
      </form>
    </Card>
  );
}
