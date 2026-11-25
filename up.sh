#!/usr/bin/env bash
# Gestor rápido de los contenedores de "Retornos y Amarres".
# Funciona desde cualquier directorio: siempre se sitúa en la raíz del repo.
# Si APP_PORT está ocupado por otro proceso, busca el siguiente puerto libre
# y actualiza .env para que los próximos arranques usen el mismo puerto.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE="$SCRIPT_DIR/.env"

# ─── Comprobaciones previas ────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: Docker no está instalado o no está en el PATH." >&2
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Docker no está en ejecución (o el usuario no tiene permisos)." >&2
    exit 1
fi

if docker compose version >/dev/null 2>&1; then
    COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1 && docker-compose version >/dev/null 2>&1; then
    COMPOSE=(docker-compose)
else
    echo "ERROR: Docker Compose no está disponible (ni 'docker compose' ni 'docker-compose')." >&2
    exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
    if [[ ! -f .env.example ]]; then
        echo "ERROR: no existe .env ni .env.example en $SCRIPT_DIR" >&2
        exit 1
    fi
    cp .env.example "$ENV_FILE"
    echo "Creado .env a partir de .env.example. Revisa JWT_SECRET antes de usar en producción."
fi

# ─── Funciones auxiliares ──────────────────────────────────────────────────
env_value() {
    sed -n "s/^[[:space:]]*$1[[:space:]]*=[[:space:]]*//p" "$ENV_FILE" \
        | head -n 1 | tr -d "\"' "
}

set_env_value() {
    local key="$1" value="$2"
    if grep -qE "^[[:space:]]*${key}[[:space:]]*=" "$ENV_FILE"; then
        sed -i -E "s|^[[:space:]]*${key}[[:space:]]*=.*|${key}=${value}|" "$ENV_FILE"
    else
        printf '\n%s=%s\n' "$key" "$value" >> "$ENV_FILE"
    fi
}

# Detecta puertos publicados por otros contenedores y procesos que escuchan
# en 127.0.0.1 o en [::1] (en Windows, localhost suele resolver a IPv6 y WSL
# puede estar sirviendo otro proyecto ahí). Los puertos solo expuestos
# (3000/tcp sin flecha) no cuentan.
port_in_use() {
    local port="$1" host
    if docker ps --format '{{.Ports}}' 2>/dev/null | grep -q ":${port}->"; then
        return 0
    fi
    for host in 127.0.0.1 ::1; do
        if (exec 3<>"/dev/tcp/${host}/${port}") 2>/dev/null; then
            exec 3<&- 3>&- 2>/dev/null || true
            return 0
        fi
    done
    return 1
}

# Comprueba que "localhost" sirva realmente esta aplicación y no un proyecto
# de WSL interponiéndose en el mismo puerto. Si curl no está disponible, se
# omite la comprobación.
localhost_ok() {
    local port="$1"
    command -v curl >/dev/null 2>&1 || return 0
    curl -fsS --max-time 5 "http://localhost:${port}/api/services" 2>/dev/null \
        | grep -q '"success"[[:space:]]*:[[:space:]]*true'
}

next_free_port() {
    local from="$1" port
    for ((port = from; port < from + 50; port++)); do
        if ! port_in_use "$port"; then
            printf '%s\n' "$port"
            return 0
        fi
    done
    return 1
}

# Comprueba que el puerto configurado esté realmente publicado por el
# contenedor web (docker compose up puede terminar bien y no publicarlo).
web_port_ok() {
    local port="$1"
    "${COMPOSE[@]}" ps --format '{{.Ports}}' 2>/dev/null | grep -q ":${port}->3000/tcp"
}

wait_healthy() {
    local timeout=180 elapsed=0 lines
    printf "Esperando a que db y web estén healthy"
    while (( elapsed < timeout )); do
        lines="$("${COMPOSE[@]}" ps --format '{{.Service}}:{{.Status}}' 2>/dev/null || true)"
        if grep -q '^db:.*(healthy)' <<<"$lines" && grep -q '^web:.*(healthy)' <<<"$lines"; then
            echo " OK"
            return 0
        fi
        printf "."
        sleep 2
        elapsed=$((elapsed + 2))
    done
    echo
    echo "ERROR: los servicios no alcanzaron el estado healthy a tiempo." >&2
    "${COMPOSE[@]}" ps || true
    "${COMPOSE[@]}" logs --tail=100 || true
    return 1
}

show_status() {
    echo
    "${COMPOSE[@]}" ps

    local port
    port="${APP_PORT:-$(env_value APP_PORT)}"
    port="${port:-3000}"

    echo
    echo "URLs de acceso:"
    echo "  Landing : http://127.0.0.1:${port}"
    echo "  Admin   : http://127.0.0.1:${port}/admin"
    echo "  API     : http://127.0.0.1:${port}/api/services"
    echo "  (el script evita puertos interceptados por WSL; si aún ves otro proyecto, usa 127.0.0.1)"
}

compose_up() {
    local log rc current port reason attempts=0
    log="$(mktemp)"

    echo "Construyendo y levantando contenedores..."
    while (( attempts < 10 )); do
        rc=0
        "${COMPOSE[@]}" up -d --build --remove-orphans 2>&1 | tee "$log" || rc=$?
        current="$(env_value APP_PORT)"
        current="${current:-3000}"

        reason=""
        if (( rc == 0 )) && web_port_ok "$current"; then
            if ! wait_healthy; then
                echo "ERROR: los servicios no están healthy; revisa los logs anteriores." >&2
                rm -f "$log"
                return 1
            fi
            if localhost_ok "$current"; then
                rm -f "$log"
                show_status
                return 0
            fi
            reason="localhost:${current} está sirviendo otro proyecto (típico de WSL en Windows)."
        elif (( rc != 0 )) && grep -qiE 'port is already allocated|address already in use|Bind for .* failed' "$log"; then
            reason="El puerto ${current} está ocupado por otro servicio."
        elif (( rc == 0 )); then
            reason="El puerto ${current} no quedó publicado por el contenedor web."
        else
            echo "ERROR: docker compose up falló; revisa los mensajes anteriores." >&2
            rm -f "$log"
            return 1
        fi

        if ! port="$(next_free_port $((current + 1)))"; then
            echo "ERROR: no se encontró un puerto libre para la aplicación." >&2
            rm -f "$log"
            return 1
        fi

        echo "$reason Buscando un puerto libre..."
        echo "Usando APP_PORT=${port}; se guarda en .env para próximos arranques."
        export APP_PORT="$port"
        set_env_value APP_PORT "$port"
        attempts=$((attempts + 1))
    done

    rm -f "$log"
    echo "ERROR: no se pudo levantar la aplicación después de varios intentos." >&2
    return 1
}

# ─── Comandos ──────────────────────────────────────────────────────────────
case "${1:-up}" in
    up)
        compose_up
        ;;
    down)
        "${COMPOSE[@]}" down --remove-orphans
        echo "Contenedores detenidos. Los datos de SQLite se conservan en el volumen db-data."
        ;;
    restart)
        "${COMPOSE[@]}" restart
        wait_healthy
        show_status
        ;;
    logs)
        "${COMPOSE[@]}" logs -f --tail=200
        ;;
    reset)
        reply=""
        if ! read -r -p "¿Eliminar el volumen db-data (SE BORRAN TODOS LOS DATOS) y volver a crear la BD? [y/N] " reply; then
            reply=""
        fi
        if [[ "$reply" =~ ^[Yy]([Ee][Ss])?$ ]]; then
            "${COMPOSE[@]}" down -v --remove-orphans
            compose_up
        else
            echo "Cancelado; no se ha eliminado nada."
        fi
        ;;
    *)
        echo "Uso: $0 {up|down|restart|logs|reset}"
        echo "  up      Construye y levanta todo (acción por defecto)"
        echo "  down    Detiene los contenedores sin borrar datos"
        echo "  restart Reinicia los contenedores"
        echo "  logs    Muestra logs en tiempo real"
        echo "  reset   Borra el volumen de datos previa confirmación"
        exit 1
        ;;
esac
