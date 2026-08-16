import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-border shadow-[0_2px_12px_rgba(15,42,74,0.07)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

const ESTADO_COLORS: Record<string, string> = {
  DISPONIBLE: "text-green bg-[#edfaf4]",
  CONTRATADO: "text-muted bg-[#f0f0f0]",
  ACTIVA: "text-green bg-[#edfaf4]",
  CUBIERTA: "text-muted bg-[#f0f0f0]",
  CERRADA: "text-muted bg-[#f0f0f0]",
  INACTIVO: "text-muted bg-[#f0f0f0]",
};

export function Badge({
  children,
  colorClass,
  estado,
}: {
  children: ReactNode;
  colorClass?: string;
  estado?: string;
}) {
  const cls = colorClass ?? (estado ? ESTADO_COLORS[estado] : "text-muted bg-[#f0f0f0]");
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${cls}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "px-3 py-1.5 text-[11px]" : "px-4 py-2.5 text-sm";
  const variants: Record<string, string> = {
    primary: "bg-coral text-white hover:bg-[#e85a2a]",
    secondary: "bg-navy text-white hover:bg-navy-dark",
    ghost: "bg-transparent border border-border text-text hover:bg-[#f1f1f1]",
    danger: "bg-red/10 text-red hover:bg-red/20",
  };
  return (
    <button
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatTile({
  label,
  value,
  icon,
  colorClass = "text-navy",
}: {
  label: string;
  value: string | number;
  icon: string;
  colorClass?: string;
}) {
  return (
    <Card className="flex flex-col gap-1.5">
      <div className="text-2xl">{icon}</div>
      <div className={`text-2xl font-extrabold ${colorClass}`}>{value}</div>
      <div className="text-[11px] text-muted font-semibold">{label}</div>
    </Card>
  );
}

export function Termometro({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const color = (v: number) =>
    v <= 3 ? "#e74c3c" : v <= 6 ? "#f39c12" : "#27ae60";
  const label =
    value <= 3
      ? "Probabilidad baja"
      : value <= 6
        ? "Probabilidad media"
        : "Alta probabilidad";

  return (
    <div>
      <div className="flex gap-1 items-center">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(n)}
            className="w-[19px] h-[19px] rounded"
            style={{
              background: n <= value ? color(n) : "#e2ddd8",
              border: n === value ? `2px solid ${color(value)}` : "2px solid transparent",
              cursor: readonly ? "default" : "pointer",
            }}
          />
        ))}
        <span
          className="font-extrabold ml-1.5 text-sm"
          style={{ color: color(value) }}
        >
          {value}/10
        </span>
      </div>
      <div className="text-[10px] text-muted mt-0.5">{label}</div>
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 rounded-lg border-[1.5px] border-border bg-cream text-sm text-text outline-none focus:border-coral ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2.5 rounded-lg border-[1.5px] border-border bg-cream text-sm text-text outline-none focus:border-coral ${props.className ?? ""}`}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-navy/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl p-5 w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4.5">
          <span className="font-extrabold text-navy text-base">{title}</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕ Cerrar
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
