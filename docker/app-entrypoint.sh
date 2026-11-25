#!/bin/sh
# Ajusta el volumen SQLite (creado por root en el primer arranque) y cede el
# control al proceso de la aplicación ejecutándolo como usuario no root.
set -eu

mkdir -p /app/db
chown -R nextjs:nodejs /app/db

exec su-exec nextjs "$@"
