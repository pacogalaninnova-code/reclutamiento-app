import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordAdmin = await bcrypt.hash("chiapas2025", 10);
  await prisma.usuario.upsert({
    where: { email: "reclutador@talenta.mx" },
    create: {
      email: "reclutador@talenta.mx",
      passwordHash: passwordAdmin,
      nombre: "Admin Talenta",
      rol: "ADMIN",
    },
    update: {},
  });

  const cerveceria = await prisma.empresa.upsert({
    where: { id: "seed-emp-1" },
    create: {
      id: "seed-emp-1",
      nombre: "Cervecería del Sur",
      sector: "CERVECERIAS",
      ciudad: "Tuxtla Gutiérrez",
      contacto: "Ricardo Méndez",
      email: "rmendez@cervesur.mx",
      telefono: "9611002233",
      temporadaPrincipal: "SEMANA_SANTA",
    },
    update: {},
  });

  const plaza = await prisma.empresa.upsert({
    where: { id: "seed-emp-2" },
    create: {
      id: "seed-emp-2",
      nombre: "Plaza Crystal Tuxtla",
      sector: "RETAIL",
      ciudad: "Tuxtla Gutiérrez",
      contacto: "Lorena Ibarra",
      email: "libarra@crystal.mx",
      telefono: "9612004455",
      temporadaPrincipal: "FIN_DE_ANO",
    },
    update: {},
  });

  const laCeiba = await prisma.empresa.upsert({
    where: { id: "seed-emp-3" },
    create: {
      id: "seed-emp-3",
      nombre: "Restaurante La Ceiba",
      sector: "RESTAURANTES",
      ciudad: "San Cristóbal",
      contacto: "Marcos Solís",
      email: "msolis@laceiba.mx",
      telefono: "9673006677",
      temporadaPrincipal: "VERANO",
    },
    update: {},
  });

  const constructora = await prisma.empresa.upsert({
    where: { id: "seed-emp-4" },
    create: {
      id: "seed-emp-4",
      nombre: "Constructora Andina",
      sector: "CONSTRUCCION",
      ciudad: "Tuxtla Gutiérrez",
      contacto: "Patricia Nuñez",
      email: "pnunez@construandina.mx",
      telefono: "9611009988",
    },
    update: {},
  });

  const passwordEmpresa = await bcrypt.hash("empresa2025", 10);
  await prisma.usuario.upsert({
    where: { email: "cervesur@talenta.mx" },
    create: {
      email: "cervesur@talenta.mx",
      passwordHash: passwordEmpresa,
      nombre: "Cervecería del Sur",
      rol: "EMPRESA",
      empresaId: cerveceria.id,
    },
    update: {},
  });

  const candidatosData = [
    {
      id: "seed-cand-1",
      nombre: "Ana Gutiérrez",
      edad: 24,
      ciudad: "Tuxtla Gutiérrez",
      telefono: "9611112233",
      email: "ana.gutierrez@gmail.com",
      experiencia: "2 años atención al cliente",
      sectores: ["CERVECERIAS", "RESTAURANTES"],
      disponibilidad: "Inmediata",
      salarioEsperado: 6000,
    },
    {
      id: "seed-cand-2",
      nombre: "Carlos Robledo",
      edad: 28,
      ciudad: "Tuxtla Gutiérrez",
      telefono: "9612223344",
      email: "carlos.robledo@gmail.com",
      experiencia: "3 años retail y logística",
      sectores: ["RETAIL", "LOGISTICA"],
      disponibilidad: "Nov 2025",
      salarioEsperado: 7500,
    },
    {
      id: "seed-cand-3",
      nombre: "Sofía Hernández",
      edad: 22,
      ciudad: "San Cristóbal",
      telefono: "9673334455",
      email: "sofia.hdz@gmail.com",
      experiencia: "1 año turismo y hostelería",
      sectores: ["TURISMO", "RESTAURANTES", "CERVECERIAS"],
      disponibilidad: "Inmediata",
      salarioEsperado: 5800,
    },
    {
      id: "seed-cand-4",
      nombre: "Diego Morales",
      edad: 31,
      ciudad: "Comitán",
      telefono: "9634445566",
      email: "diego.morales@gmail.com",
      experiencia: "5 años eventos y catering",
      sectores: ["EVENTOS", "CATERING", "RESTAURANTES"],
      disponibilidad: "Inmediata",
      salarioEsperado: 8000,
    },
    {
      id: "seed-cand-5",
      nombre: "Mariana Cruz",
      edad: 29,
      ciudad: "Tuxtla Gutiérrez",
      telefono: "9611234567",
      email: "mariana.cruz@gmail.com",
      experiencia: "6 años en contabilidad y finanzas corporativas",
      sectores: ["FINANZAS", "ADMINISTRACION"],
      disponibilidad: "15 días",
      salarioEsperado: 18000,
    },
  ] as const;

  for (const c of candidatosData) {
    await prisma.candidato.upsert({
      where: { id: c.id },
      create: { ...c, sectores: [...c.sectores] },
      update: {},
    });
  }

  const passwordCandidato = await bcrypt.hash("candidato2025", 10);
  await prisma.usuario.upsert({
    where: { email: "sofia.hdz@gmail.com" },
    create: {
      email: "sofia.hdz@gmail.com",
      passwordHash: passwordCandidato,
      nombre: "Sofía Hernández",
      rol: "CANDIDATO",
      candidatoId: "seed-cand-3",
    },
    update: {},
  });

  const vacante1 = await prisma.vacante.upsert({
    where: { id: "seed-vac-1" },
    create: {
      id: "seed-vac-1",
      empresaId: cerveceria.id,
      puesto: "Promotor de Ventas",
      sector: "CERVECERIAS",
      ciudad: "Tuxtla Gutiérrez",
      plazas: 5,
      salario: 6500,
      tipoContrato: "TEMPORAL",
      temporada: "SEMANA_SANTA",
      estado: "ACTIVA",
    },
    update: {},
  });

  await prisma.vacante.upsert({
    where: { id: "seed-vac-2" },
    create: {
      id: "seed-vac-2",
      empresaId: plaza.id,
      puesto: "Asesor de Piso",
      sector: "RETAIL",
      ciudad: "Tuxtla Gutiérrez",
      plazas: 8,
      salario: 7200,
      tipoContrato: "TEMPORAL",
      temporada: "FIN_DE_ANO",
      estado: "ACTIVA",
    },
    update: {},
  });

  const vacante3 = await prisma.vacante.upsert({
    where: { id: "seed-vac-3" },
    create: {
      id: "seed-vac-3",
      empresaId: laCeiba.id,
      puesto: "Mesero",
      sector: "RESTAURANTES",
      ciudad: "San Cristóbal",
      plazas: 4,
      salario: 5800,
      tipoContrato: "TEMPORAL",
      temporada: "VERANO",
      estado: "CUBIERTA",
    },
    update: {},
  });

  await prisma.aplicacion.upsert({
    where: { vacanteId_candidatoId: { vacanteId: vacante3.id, candidatoId: "seed-cand-3" } },
    create: {
      vacanteId: vacante3.id,
      candidatoId: "seed-cand-3",
      etapa: "CONTRATADO",
      termometro: 10,
    },
    update: {},
  });
  await prisma.candidato.update({
    where: { id: "seed-cand-3" },
    data: { estado: "CONTRATADO" },
  });

  await prisma.aplicacion.upsert({
    where: { vacanteId_candidatoId: { vacanteId: vacante1.id, candidatoId: "seed-cand-1" } },
    create: {
      vacanteId: vacante1.id,
      candidatoId: "seed-cand-1",
      etapa: "ENTREVISTA",
      termometro: 7,
    },
    update: {},
  });

  const vacantePermanente = await prisma.vacante.upsert({
    where: { id: "seed-vac-4" },
    create: {
      id: "seed-vac-4",
      empresaId: constructora.id,
      puesto: "Contador General",
      sector: "FINANZAS",
      ciudad: "Tuxtla Gutiérrez",
      plazas: 1,
      salario: 18000,
      tipoContrato: "PERMANENTE",
      estado: "ACTIVA",
    },
    update: {},
  });

  await prisma.aplicacion.upsert({
    where: { vacanteId_candidatoId: { vacanteId: vacantePermanente.id, candidatoId: "seed-cand-5" } },
    create: {
      vacanteId: vacantePermanente.id,
      candidatoId: "seed-cand-5",
      etapa: "DOCUMENTOS",
      termometro: 8,
    },
    update: {},
  });

  console.log("Seed completo.");
  console.log("Reclutador:  reclutador@talenta.mx / chiapas2025");
  console.log("Empresa:     cervesur@talenta.mx / empresa2025");
  console.log("Candidato:   sofia.hdz@gmail.com / candidato2025");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
