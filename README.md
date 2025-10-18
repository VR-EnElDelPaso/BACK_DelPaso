# MUVI — Backend (DelPaso)

Este repositorio contiene el backend TypeScript para el proyecto MUVI (DelPaso). Incluye autenticación (local + JWT + SAML), integración con MercadoPago, subida de archivos a Cloudinary, envío de correos con Nodemailer/Mailtrap y acceso a la base de datos mediante Prisma.

## Contenido relevante

- `src/` — código fuente TypeScript.
- `prisma/` — esquema de Prisma, migraciones y seed.
- `docker-compose.yml` — servicio de base de datos para desarrollo.
- `.env.template` — plantilla de variables de entorno.
- `.env` — archivo de entorno (NO modificar desde este script; está en el repo para referencia).

## Requisitos previos

- Node.js 20+
- npm 10+
- Docker (para ejecutar la base de datos en desarrollo)

## Preparación y ejecución (desarrollo)

1. Instala dependencias:

```bash
npm install
```

2. Variables de entorno:

- Copia ` .env.template` a `.env` y rellena los valores necesarios para tu entorno.
- El repositorio contiene un `.env` con valores de ejemplo que no debes usar en producción.

3. Inicia la base de datos de desarrollo (opcional, recomendado si trabajas localmente):

```bash
docker compose up -d
```

4. Configura Prisma y aplica migraciones/seed:

```bash
npx prisma generate
npx prisma migrate dev
npm run seed   # opcional: si quieres cargar datos de ejemplo
```

5. Ejecuta el servidor en modo desarrollo:

```bash
npm run dev
```

La API quedará expuesta por defecto en `http://localhost:4006` si no cambias `PORT`.

## Scripts útiles

- `npm run dev` — arranca el servidor con `ts-node` y `nodemon`.
- `npm run build` — compila TypeScript (`tsc`).
- `npm run start` — ejecuta las migraciones (deploy) y arranca `dist` compilado.
- `npm run migrate` — atajo para `npx prisma migrate dev`.

## Variables de entorno (documentadas)

A continuación se listan las variables de entorno que el proyecto utiliza. Están agrupadas por finalidad y marcadas como REQUERIDAS u OPCIONALES.

- General / App
   - NODE_ENV — REQUERIDO (ej: `development` | `production`)
   - PORT — OPCIONAL (por defecto 4006)
   - SESSIONS_SECRET — REQUERIDO
   - HOST_URL — REQUERIDO para callbacks (SAML u otras integraciones)
   - CLIENT_URL — REQUERIDO (URL del frontend)

- Autenticación
   - PASSPORT_STRATEGY — OPCIONAL (ej: `saml`)
   - JWT_SECRET — REQUERIDO en producción

- SAML (si usas SAML)
   - SAML_ISSUER — REQUERIDO si SAML está habilitado
   - SAML_ENTRY_POINT — REQUERIDO si SAML está habilitado
   - SAML_LOGOUT_URL — REQUERIDO si SAML está habilitado
   - SAML_CALLBACK_URL — OPCIONAL
   - SAML_LOGOUT_CALLBACK_URL — OPCIONAL
   - Certificados — archivos en `certs/` (`key.pem`, `idp.crt`, `cert.pem`) son necesarios si SAML está habilitado

- Base de datos / Prisma
   - DB_URL — REQUERIDO por Prisma
   - DB_HOST, DB_PASSWORD — OPCIONALES para docker-compose local

- MercadoPago
   - MERCADO_PAGO_ACCESS_TOKEN — REQUERIDO si usas pagos
   - MP_PREFERENCE_SUCCESS_URL, MP_PREFERENCE_FAILURE_URL, MP_PREFERENCE_PENDING_URL — REQUERIDOS si usas preferencias de pago

- Cloudinary (almacenamiento de archivos)
   - CLOUDINARY_CLOUD_NAME — REQUERIDO si usas Cloudinary
   - CLOUDINARY_API_KEY — REQUERIDO
   - CLOUDINARY_API_SECRET — REQUERIDO
   - CLOUDINARY_URL — OPCIONAL (no requerido por el código)

- Email
   - SMTP_HOST — REQUERIDO para Nodemailer
   - SMTP_PORT — REQUERIDO
   - SMTP_USER — REQUERIDO
   - SMTP_PASS — REQUERIDO
   - MAILTRAP_TOKEN — OPCIONAL (si prefieres Mailtrap)

Variables que aparecen en `.env`/`.env.template` pero NO se usan en el código (o se usan solo como datos de prueba):

- COMPRADOR_USER, COMPRADOR_PASSWORD, VENDEDOR_USER, VENDEDOR_PASSWORD — credenciales de prueba de MercadoPago incluidas como ejemplo; no se usan por el código directamente.
- NRO_TARJETA*, VENCIMIENTO*, CVV* — números de tarjeta de prueba para MercadoPago; solo para referencia.
- CLOUDINARY_URL — como se comentó, el proyecto utiliza `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` directamente.

Si encuentras variables en `.env.template` que no listé arriba y crees que deberían incluirse en producción, dímelo y las añado.

## Implementaciones y archivos clave (qué está activo / qué revisar)

- Autenticación
   - `src/passport.ts` — configura Passport con:
      - LocalStrategy (email + password).
      - JwtStrategy (tokens Bearer).
      - SamlStrategy (SAML) — si SAML está habilitado, se leen los certificados en `certs/` y las rutas en `src/routes/auth.routes.ts` y `src/routes/metadata.routes.ts` exponen endpoints relacionados.
   - `src/routes/auth.routes.ts` — rutas de login/logout/callback para SAML y rutas relacionadas de autenticación.

- Cloudinary
   - `src/config/cloudinary.ts` — inicializa la librería con las 3 variables.
   - `src/controllers/storage.controllers.ts` — endpoints para subir/Eliminar assets en Cloudinary.

- Mail
   - `src/config/email.config.ts` — configura Nodemailer desde SMTP_*.
   - `src/services/email.services.ts` — funciones que construyen y envían correos (ver `sendVerificationEmail`).
   - `src/mailtrap/mailtrap.config.ts` — cliente Mailtrap (usa `MAILTRAP_TOKEN`). Está presente si prefieres enviar a Mailtrap en lugar de SMTP.

- MercadoPago
   - `src/mercadopago.ts` — cliente configurado usando `MERCADO_PAGO_ACCESS_TOKEN`.
   - `src/services/preference.services.ts` — crea preferencias (back_urls vienen de `MP_PREFERENCE_*` variables).

- Base de datos / Prisma
   - `prisma/schema.prisma` — el archivo de esquema usa `env("DB_URL")`.

## Notas importantes / caveats

- Seguridad: no incluyas secretos reales (`JWT_SECRET`, `MERCADO_PAGO_ACCESS_TOKEN`, claves de Cloudinary, contraseñas SMTP, etc.) en repositorios públicos.
- `.env` que tienes en el repositorio contiene valores de ejemplo / testing. No lo uses en producción.
- SAML requiere que los archivos de certificado estén presentes en `certs/` y que `HOST_URL` esté correctamente configurado.
- Mailtrap está presente. Si prefieres usar Mailtrap como proveedor de pruebas, define `MAILTRAP_TOKEN`. Si usas SMTP real, rellena `SMTP_*`.

## Archivos que conviene revisar al clonar

- `src/config/index.ts` — centraliza las principales variables de configuración.
- `src/passport.ts` — flujo de autenticación (revisa si quieres mantener SAML habilitado).
- `prisma/schema.prisma` — modelos y migraciones.
- `docker-compose.yml` — definiendo la base de datos local.
