"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input, Label, Button } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(true);
      return;
    }
    router.push(searchParams.get("callbackUrl") ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={doLogin}>
      <div className="mb-3.5">
        <Label>Correo</Label>
        <Input
          type="email"
          placeholder="tu_correo@ejemplo.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(false);
          }}
          autoFocus
          required
        />
      </div>
      <div className="mb-5">
        <Label>Contraseña</Label>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          required
        />
      </div>
      {error && (
        <div className="bg-[#FFF0EF] border border-red/30 rounded-lg px-3 py-2.5 text-xs text-red mb-3.5 font-semibold">
          ⚠️ Correo o contraseña incorrectos
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full !py-3 !text-sm">
        {loading ? "Ingresando..." : "Iniciar Sesión"}
      </Button>
      <div className="text-center mt-4 text-[11px] text-muted">
        Credenciales asignadas por el equipo de TalentTemp
      </div>
    </form>
  );
}
