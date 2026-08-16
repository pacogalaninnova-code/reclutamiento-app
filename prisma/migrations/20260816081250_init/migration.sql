-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'RECLUTADOR', 'EMPRESA', 'CANDIDATO');

-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('CERVECERIAS', 'RETAIL', 'RESTAURANTES', 'HOTELES', 'TURISMO', 'EVENTOS', 'LOGISTICA', 'CATERING', 'BALNEARIOS');

-- CreateEnum
CREATE TYPE "Temporada" AS ENUM ('SEMANA_SANTA', 'VERANO', 'FIESTAS_PATRIAS', 'FIN_DE_ANO');

-- CreateEnum
CREATE TYPE "EstadoVacante" AS ENUM ('ACTIVA', 'CUBIERTA', 'CERRADA');

-- CreateEnum
CREATE TYPE "EstadoCandidato" AS ENUM ('DISPONIBLE', 'CONTRATADO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EtapaProceso" AS ENUM ('APLICO', 'ENTREVISTA', 'DOCUMENTOS', 'EVALUACION', 'FIRMA_CONTRATO', 'CONTRATADO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('INE', 'COMPROBANTE_DOMICILIO', 'CARTA_RECOMENDACION', 'COMPROBANTE_ESTUDIOS', 'LICENCIA_CONDUCIR', 'CURP', 'RFC');

-- CreateEnum
CREATE TYPE "EstadoDocumento" AS ENUM ('PENDIENTE', 'ADJUNTO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT,
    "candidatoId" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sector" "Sector" NOT NULL,
    "ciudad" TEXT NOT NULL,
    "contacto" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "temporadaPrincipal" "Temporada",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vacante" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "puesto" TEXT NOT NULL,
    "sector" "Sector" NOT NULL,
    "ciudad" TEXT NOT NULL,
    "plazas" INTEGER NOT NULL,
    "salario" INTEGER NOT NULL,
    "temporada" "Temporada" NOT NULL,
    "estado" "EstadoVacante" NOT NULL DEFAULT 'ACTIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vacante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidato" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "edad" INTEGER,
    "ciudad" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "experiencia" TEXT,
    "sectores" "Sector"[],
    "disponibilidad" TEXT,
    "salarioEsperado" INTEGER,
    "estado" "EstadoCandidato" NOT NULL DEFAULT 'DISPONIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aplicacion" (
    "id" TEXT NOT NULL,
    "vacanteId" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "etapa" "EtapaProceso" NOT NULL DEFAULT 'APLICO',
    "termometro" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aplicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "estado" "EstadoDocumento" NOT NULL DEFAULT 'PENDIENTE',
    "nombreArchivo" TEXT,
    "url" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_empresaId_key" ON "Usuario"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_candidatoId_key" ON "Usuario"("candidatoId");

-- CreateIndex
CREATE UNIQUE INDEX "Aplicacion_vacanteId_candidatoId_key" ON "Aplicacion"("vacanteId", "candidatoId");

-- CreateIndex
CREATE UNIQUE INDEX "Documento_candidatoId_tipo_key" ON "Documento"("candidatoId", "tipo");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacante" ADD CONSTRAINT "Vacante_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aplicacion" ADD CONSTRAINT "Aplicacion_vacanteId_fkey" FOREIGN KEY ("vacanteId") REFERENCES "Vacante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aplicacion" ADD CONSTRAINT "Aplicacion_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;
