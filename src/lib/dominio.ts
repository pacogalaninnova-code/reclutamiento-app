export const SECTOR_LABEL: Record<string, string> = {
  CERVECERIAS: "Cervecerías",
  RETAIL: "Retail",
  RESTAURANTES: "Restaurantes",
  HOTELES: "Hoteles",
  TURISMO: "Turismo",
  EVENTOS: "Eventos",
  LOGISTICA: "Logística",
  CATERING: "Catering",
  BALNEARIOS: "Balnearios",
};

export const TEMPORADA_INFO: Record<
  string,
  { label: string; meses: string; icono: string; color: string; bg: string }
> = {
  SEMANA_SANTA: {
    label: "Semana Santa",
    meses: "Mar–Abr",
    icono: "🌊",
    color: "#E9A820",
    bg: "#FFF8E7",
  },
  VERANO: {
    label: "Verano",
    meses: "Jul–Ago",
    icono: "☀️",
    color: "#FF6B35",
    bg: "#FFF4F0",
  },
  FIESTAS_PATRIAS: {
    label: "Fiestas Patrias",
    meses: "Septiembre",
    icono: "🎉",
    color: "#2D9E6B",
    bg: "#EDFAF4",
  },
  FIN_DE_ANO: {
    label: "Fin de Año",
    meses: "Nov–Dic",
    icono: "🎄",
    color: "#C0392B",
    bg: "#FFF0EF",
  },
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
  APLICO: "text-[#1C2B3A] bg-[#E8EBF0]",
  ENTREVISTA: "text-gold bg-[#FFF8E7]",
  DOCUMENTOS: "text-purple bg-[#F5EEFF]",
  EVALUACION: "text-coral bg-[#FFF0EB]",
  FIRMA_CONTRATO: "text-blue bg-[#EBF5FB]",
  CONTRATADO: "text-green bg-[#EDFAF4]",
};

export const DOCUMENTOS: { key: string; label: string; icon: string }[] = [
  { key: "INE", label: "INE", icon: "🪪" },
  { key: "COMPROBANTE_DOMICILIO", label: "Comprobante de Domicilio", icon: "🏠" },
  { key: "CARTA_RECOMENDACION", label: "Carta de Recomendación", icon: "📝" },
  { key: "COMPROBANTE_ESTUDIOS", label: "Comprobante de Estudios", icon: "🎓" },
  { key: "LICENCIA_CONDUCIR", label: "Licencia de Conducir", icon: "🚗" },
  { key: "CURP", label: "CURP", icon: "📄" },
  { key: "RFC", label: "RFC", icon: "🧾" },
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
