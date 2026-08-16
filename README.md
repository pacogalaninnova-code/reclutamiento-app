# Talenta — Reclutamiento y Selección de Personal

Plataforma de reclutamiento y selección de personal (contratación permanente y temporal/por temporada), con tres portales según rol:

- **Reclutador / Administrador** (`/reclutador`): dashboard, empresas, vacantes con pipeline de selección, candidatos con expediente documental, feed de actividad de todas las cuentas, reportes de comisiones, configuración.
- **Empresa** (`/empresa`): las empresas cliente solicitan vacantes y ven el proceso de sus candidatos.
- **Candidato** (`/candidato`): los candidatos ven su estatus, editan su perfil y suben su expediente documental.

## Stack

Next.js (App Router) + TypeScript + Prisma/PostgreSQL + NextAuth (credentials) + Vercel Blob (documentos) + Tailwind CSS + lucide-react (iconografía).

## Desarrollo local

1. Copia `.env` y ajusta `DATABASE_URL` a tu Postgres local.
2. `npm install`
3. `npx prisma migrate dev`
4. `npm run db:seed` — crea usuarios de ejemplo:
   - Reclutador (admin): `reclutador@talenta.mx` / `chiapas2025`
   - Empresa: `cervesur@talenta.mx` / `empresa2025`
   - Candidato: `sofia.hdz@gmail.com` / `candidato2025`
5. `npm run dev`

## Variables de entorno para producción

- `DATABASE_URL` — Postgres (Vercel Postgres, Neon, Supabase, etc.)
- `NEXTAUTH_SECRET` — valor aleatorio seguro
- `NEXTAUTH_URL` — URL pública del deployment
- `BLOB_READ_WRITE_TOKEN` — token de [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) para subir documentos de candidatos
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — servidor SMTP para las notificaciones automáticas por correo (cualquier proveedor: Resend, Mailgun, Gmail, etc.). Si se dejan vacías, el envío se omite y solo se registra en el log del servidor — la app sigue funcionando normalmente.

## Funcionalidad

- **Contratación general o por temporada**: cada vacante se publica como Permanente o Temporal; solo las temporales piden una temporada (Semana Santa, Verano, Fiestas Patrias, Fin de Año). El catálogo de sectores cubre tanto giros generales (Tecnología, Salud, Finanzas, Construcción, etc.) como los de hospitalidad/temporada.
- **Aprobación de vacantes**: cuando una empresa solicita una vacante desde su portal, queda en estado `PENDIENTE` hasta que un reclutador la aprueba o rechaza desde `/reclutador/vacantes`.
- **Actividad y alertas al administrador**: toda acción de una empresa o candidato (solicitar vacante, actualizar perfil, subir/eliminar documento, cambiar contraseña) queda registrada en `/reclutador/actividad` y genera un correo automático a los usuarios ADMIN/RECLUTADOR.
- **Notificaciones al candidato**: al avanzar su etapa en el pipeline, se le envía un correo automático (si SMTP está configurado). El botón de WhatsApp sigue siendo manual (abre un enlace `wa.me` prellenado).
- **Mi Cuenta**: cada usuario (cualquier rol) puede cambiar su propia contraseña y (empresa/candidato) editar su propio perfil, desde el ícono de su nombre en el header.
