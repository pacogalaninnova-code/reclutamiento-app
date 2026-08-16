import {
  IdCard,
  Home,
  FileText,
  GraduationCap,
  Car,
  BadgeCheck,
  Receipt,
  Flower2,
  Sun,
  Flag,
  Snowflake,
  type LucideIcon,
} from "lucide-react";
import { APP_NAME } from "@/lib/marca";

export const SECTOR_LABEL: Record<string, string> = {
  TECNOLOGIA: "Tecnología",
  MANUFACTURA: "Manufactura",
  SALUD: "Salud",
  EDUCACION: "Educación",
  SERVICIOS_PROFESIONALES: "Servicios Profesionales",
  CONSTRUCCION: "Construcción",
  FINANZAS: "Finanzas y Seguros",
  ADMINISTRACION: "Administración",
  VENTAS: "Ventas",
  RECURSOS_HUMANOS: "Recursos Humanos",
  LEGAL: "Legal",
  MARKETING: "Marketing y Publicidad",
  LOGISTICA: "Transporte y Logística",
  AGROINDUSTRIA: "Agroindustria",
  RETAIL: "Retail",
  RESTAURANTES: "Restaurantes",
  HOTELES: "Hoteles",
  TURISMO: "Turismo",
  EVENTOS: "Eventos",
  CERVECERIAS: "Cervecerías",
  CATERING: "Catering",
  BALNEARIOS: "Balnearios",
  OTRO: "Otro",
};

export const TIPO_CONTRATO_LABEL: Record<string, string> = {
  PERMANENTE: "Permanente",
  TEMPORAL: "Temporal / Por Temporada",
};

export const TEMPORADA_INFO: Record<
  string,
  { label: string; meses: string; icono: LucideIcon; color: string; bg: string }
> = {
  SEMANA_SANTA: {
    label: "Semana Santa",
    meses: "Mar–Abr",
    icono: Flower2,
    color: "#8a6d1f",
    bg: "#F7F1E3",
  },
  VERANO: {
    label: "Verano",
    meses: "Jul–Ago",
    icono: Sun,
    color: "#0f766e",
    bg: "#E6F2F1",
  },
  FIESTAS_PATRIAS: {
    label: "Fiestas Patrias",
    meses: "Septiembre",
    icono: Flag,
    color: "#15803d",
    bg: "#EAF3ED",
  },
  FIN_DE_ANO: {
    label: "Fin de Año",
    meses: "Nov–Dic",
    icono: Snowflake,
    color: "#3b5b7a",
    bg: "#E9EFF4",
  },
};

export const MENSAJE_ETAPA: Record<string, (nombre: string, puesto: string) => string> = {
  ENTREVISTA: (nombre, puesto) =>
    `Hola ${nombre}, fuiste seleccionado/a para una entrevista para el puesto de ${puesto}. Te contactamos pronto. – ${APP_NAME}`,
  DOCUMENTOS: (nombre) =>
    `Hola ${nombre}, el siguiente paso es reunir tus documentos: INE, comprobante de domicilio y más. – ${APP_NAME}`,
  EVALUACION: (nombre) =>
    `Hola ${nombre}, tus documentos están en orden. Estás en fase de evaluación. – ${APP_NAME}`,
  FIRMA_CONTRATO: (nombre) =>
    `Hola ${nombre}, procederemos con la firma de contrato. Contáctanos para coordinar. – ${APP_NAME}`,
  CONTRATADO: (nombre, puesto) =>
    `Hola ${nombre}, felicidades! Has sido contratado/a oficialmente para ${puesto}. Bienvenido/a al equipo. – ${APP_NAME}`,
};

export const ETAPAS: { key: string; label: string }[] = [
  { key: "APLICO", label: "Aplicó" },
  { key: "ENTREVISTA", label: "Entrevista" },
  { key: "DOCUMENTOS", label: "Documentos" },
  { key: "EVALUACION", label: "Evaluación" },
  { key: "FIRMA_CONTRATO", label: "Firma de Contrato" },
  { key: "CONTRATADO", label: "Contratado" },
];

export const ETAPA_LABEL: Record<string, string> = Object.fromEntries(
  ETAPAS.map((e) => [e.key, e.label])
);

export const ETAPA_COLOR: Record<string, string> = {
  APLICO: "text-[#1E293B] bg-[#EEF1F4]",
  ENTREVISTA: "text-highlight bg-[#FBF0E4]",
  DOCUMENTOS: "text-violet bg-[#ECEBF5]",
  EVALUACION: "text-accent bg-[#E6F2F1]",
  FIRMA_CONTRATO: "text-blue bg-[#E9EFF4]",
  CONTRATADO: "text-green bg-[#EAF3ED]",
};

export const DOCUMENTOS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "INE", label: "INE", icon: IdCard },
  { key: "COMPROBANTE_DOMICILIO", label: "Comprobante de Domicilio", icon: Home },
  { key: "CARTA_RECOMENDACION", label: "Carta de Recomendación", icon: FileText },
  { key: "COMPROBANTE_ESTUDIOS", label: "Comprobante de Estudios", icon: GraduationCap },
  { key: "LICENCIA_CONDUCIR", label: "Licencia de Conducir", icon: Car },
  { key: "CURP", label: "CURP", icon: BadgeCheck },
  { key: "RFC", label: "RFC", icon: Receipt },
];

// Modelo comercial: 1 mes de sueldo por contratación (actualizado desde 15%)
export function comision(salario: number): number {
  return Math.round(salario);
}

export function fmt(n: number | null | undefined): string {
  return "$" + Number(n || 0).toLocaleString("es-MX");
}

export function siguienteEtapa(etapaActual: string): string | null {
  const idx = ETAPAS.findIndex((e) => e.key === etapaActual);
  if (idx === -1 || idx === ETAPAS.length - 1) return null;
  return ETAPAS[idx + 1].key;
}

export function docPct(
  documentos: { tipo: string; estado: string }[]
): number {
  if (!documentos) return 0;
  const adjuntos = documentos.filter((d) => d.estado === "ADJUNTO").length;
  return Math.round((adjuntos / DOCUMENTOS.length) * 100);
}
