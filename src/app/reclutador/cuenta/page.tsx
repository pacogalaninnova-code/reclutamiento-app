import { CambiarPasswordForm } from "@/components/cambiar-password-form";

export default function CuentaPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-extrabold text-navy mb-5">Mi Cuenta</h2>
      <CambiarPasswordForm />
    </div>
  );
}
