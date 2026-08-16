# TalentTemp — Reclutamiento y Selección de Personal

Plataforma de reclutamiento de personal de temporada (Chiapas), con tres portales según rol:

- **Reclutador** (`/reclutador`): dashboard, empresas, vacantes con pipeline de selección, candidatos con expediente documental, reportes de comisiones, configuración.
- **Empresa** (`/empresa`): las empresas cliente ven sus vacantes y el proceso de sus candidatos.
- **Candidato** (`/candidato`): los candidatos ven su estatus y suben su expediente documental.

## Stack

Next.js (App Router) + TypeScript + Prisma/PostgreSQL + NextAuth (credentials) + Vercel Blob (documentos) + Tailwind CSS.

## Desarrollo local

1. Copia `.env` y ajusta `DATABASE_URL` a tu Postgres local.
2. `npm install`
3. `npx prisma migrate dev`
4. `npm run db:seed` — crea usuarios de ejemplo:
   - Reclutador: `reclutador@talenttemp.mx` / `chiapas2025`
   - Empresa: `cervesur@talenttemp.mx` / `empresa2025`
   - Candidato: `sofia.hdz@gmail.com` / `candidato2025`
5. `npm run dev`

## Variables de entorno para producción

- `DATABASE_URL` — Postgres (Vercel Postgres, Neon, Supabase, etc.)
- `NEXTAUTH_SECRET` — valor aleatorio seguro
- `NEXTAUTH_URL` — URL pública del deployment
- `BLOB_READ_WRITE_TOKEN` — token de [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) para subir documentos de candidatos
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — servidor SMTP para las notificaciones automáticas por correo al candidato cuando avanza de etapa (cualquier proveedor: Resend, Mailgun, Gmail, etc.). Si se dejan vacías, el envío se omite y solo se registra en el log del servidor — la app sigue funcionando normalmente.

## Funcionalidad

- **Aprobación de vacantes**: cuando una empresa solicita una vacante desde su portal, queda en estado `PENDIENTE` hasta que un reclutador la aprueba o rechaza desde `/reclutador/vacantes`.
- **Notificaciones automáticas**: al avanzar la etapa de un candidato en el pipeline, se le envía un correo automático (si SMTP está configurado). El botón de WhatsApp sigue siendo manual (abre un enlace `wa.me` prellenado).
- **Mi Cuenta**: cada usuario (cualquier rol) puede cambiar su propia contraseña desde el ícono de su nombre en el header.
