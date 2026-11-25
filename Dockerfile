# syntax=docker/dockerfile:1

# ─── Base común ────────────────────────────────────────────────────────────
# Alpine mantiene la imagen pequeña. openssl/libc6-compat son necesarios para
# los motores de Prisma; su-exec permite arrancar como root solo para ajustar
# los permisos del volumen y después ejecutar el proceso como usuario no root.
FROM node:22-alpine AS base
RUN apk add --no-cache openssl libc6-compat su-exec \
    && addgroup -S nodejs \
    && adduser -S -h /home/nextjs -G nodejs nextjs
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_CACHE=/tmp/npm-cache

# ─── Dependencias (capa cacheable) ─────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ─── Build de Next.js (standalone) ─────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Valor ficticio solo para que Prisma/Next puedan construir; el contenedor
# final usa el DATABASE_URL real inyectado por docker compose.
ENV DATABASE_URL="file:../db/build.db"
RUN npm run db:generate && npm run build

# ─── Servicio de base de datos (inicializa y mantiene el archivo SQLite) ───
FROM base AS db
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma
# prisma/seed.ts importa ../src/lib/db, así que esa carpeta también hace falta.
COPY src/lib ./src/lib
COPY docker ./docker
ENV DATABASE_URL="file:../db/custom.db" \
    HOME=/home/nextjs
RUN npm run db:generate
COPY docker/db-entrypoint.sh /usr/local/bin/db-entrypoint.sh
RUN chmod +x /usr/local/bin/db-entrypoint.sh
USER root
ENTRYPOINT ["/usr/local/bin/db-entrypoint.sh"]

# ─── Imagen final de la aplicación ─────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    HOME=/home/nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Aseguramos el cliente generado de Prisma por si el tracer de Next no lo incluyó.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
# Prisma resuelve file:../db/custom.db respecto a prisma/schema.prisma.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app /app/db
COPY docker/app-entrypoint.sh /usr/local/bin/app-entrypoint.sh
RUN chmod +x /usr/local/bin/app-entrypoint.sh
USER root
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/app-entrypoint.sh"]
CMD ["node", "server.js"]
