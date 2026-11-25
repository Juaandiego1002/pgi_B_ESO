#!/bin/sh
# Inicializa el archivo SQLite compartido, sincroniza el esquema con Prisma y
# siembra datos de ejemplo solo cuando la base de datos se crea por primera vez.
set -eu

DB_DIR=/app/db
DB_FILE="$DB_DIR/custom.db"

mkdir -p "$DB_DIR"
chown -R nextjs:nodejs "$DB_DIR"

NEW_DB=0
if [ ! -f "$DB_FILE" ]; then
    NEW_DB=1
fi

echo "Sincronizando esquema de la base de datos..."
su-exec nextjs ./node_modules/.bin/prisma db push --skip-generate

if [ "$NEW_DB" -eq 1 ] && [ "${SEED_ON_START:-true}" = "true" ]; then
    echo "Base de datos nueva: cargando datos de ejemplo..."
    su-exec nextjs ./node_modules/.bin/tsx prisma/seed.ts
else
    echo "Base de datos existente o seed desactivado: no se insertan datos de ejemplo."
fi

touch "$DB_FILE"
chown nextjs:nodejs "$DB_FILE"

echo "Base de datos lista en $DB_FILE"
# Sin argumentos externos, queda vivo para que depends_on pueda esperar a
# service_healthy. Si se pasa un comando (útil para pruebas), se ejecuta tal cual.
if [ "$#" -gt 0 ]; then
    exec su-exec nextjs "$@"
fi
exec su-exec nextjs tail -f /dev/null
