-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('PERMANENTE', 'TEMPORAL');

-- CreateEnum
CREATE TYPE "TipoActividad" AS ENUM ('VACANTE_SOLICITADA', 'PERFIL_EMPRESA_ACTUALIZADO', 'PERFIL_CANDIDATO_ACTUALIZADO', 'DOCUMENTO_SUBIDO', 'DOCUMENTO_ELIMINADO', 'PASSWORD_CAMBIADO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Sector" ADD VALUE 'TECNOLOGIA';
ALTER TYPE "Sector" ADD VALUE 'MANUFACTURA';
ALTER TYPE "Sector" ADD VALUE 'SALUD';
ALTER TYPE "Sector" ADD VALUE 'EDUCACION';
ALTER TYPE "Sector" ADD VALUE 'SERVICIOS_PROFESIONALES';
ALTER TYPE "Sector" ADD VALUE 'CONSTRUCCION';
ALTER TYPE "Sector" ADD VALUE 'FINANZAS';
ALTER TYPE "Sector" ADD VALUE 'ADMINISTRACION';
ALTER TYPE "Sector" ADD VALUE 'VENTAS';
ALTER TYPE "Sector" ADD VALUE 'RECURSOS_HUMANOS';
ALTER TYPE "Sector" ADD VALUE 'LEGAL';
ALTER TYPE "Sector" ADD VALUE 'MARKETING';
ALTER TYPE "Sector" ADD VALUE 'AGROINDUSTRIA';
ALTER TYPE "Sector" ADD VALUE 'OTRO';

-- AlterTable
ALTER TABLE "Vacante" ADD COLUMN     "tipoContrato" "TipoContrato" NOT NULL DEFAULT 'PERMANENTE',
ALTER COLUMN "temporada" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Actividad" (
    "id" TEXT NOT NULL,
    "tipo" "TipoActividad" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "actorRol" "Rol" NOT NULL,
    "actorNombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "empresaId" TEXT,
    "candidatoId" TEXT,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Actividad_createdAt_idx" ON "Actividad"("createdAt");

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE SET NULL ON UPDATE CASCADE;
