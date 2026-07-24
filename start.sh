#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")" && pwd)"
if [[ ! -f "$project_dir/.env" ]]; then
  echo "Missing $project_dir/.env; copy .env.example and provide real values." >&2
  exit 1
fi

load_env_file() {
  local key value
  while IFS='=' read -r key value; do
    key="${key#export }"
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    [[ -z "${!key+x}" ]] || continue
    value="${value%$'\r'}"
    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
      value="${value:1:${#value}-2}"
    fi
    export "$key=$value"
  done < "$project_dir/.env"
}

load_env_file
: "${BACKEND_PORT:?BACKEND_PORT is required}"
: "${FRONTEND_PORT:?FRONTEND_PORT is required}"
export CORS_ORIGINS="${CORS_ORIGINS:-http://127.0.0.1:$FRONTEND_PORT}"
if [[ "${NODE_ENV:-development}" != "production" ]]; then
  export ENABLE_LEGACY_PROVIDER_ROUTES=true
fi
for dependency_dir in "$project_dir/backend/node_modules"; do
  if [[ ! -d "$dependency_dir" ]]; then
    echo "Missing $dependency_dir; install dependencies explicitly before starting." >&2
    exit 1
  fi
done

if [[ ! -d "$project_dir/frontend/node_modules" ]]; then
  echo "Missing $project_dir/frontend/node_modules; install dependencies explicitly before starting." >&2
  exit 1
fi

(cd "$project_dir/backend" && exec node src/scripts/runtime-bootstrap.js)

(cd "$project_dir/backend" && exec node src/server.js) &
backend_pid=$!
(cd "$project_dir/frontend" && exec env BROWSER=none PORT="$FRONTEND_PORT" REACT_APP_API_URL="http://127.0.0.1:$BACKEND_PORT/api" ./node_modules/.bin/react-scripts start) &
frontend_pid=$!

cleanup() {
  trap - EXIT INT TERM
  kill "$backend_pid" "$frontend_pid" 2>/dev/null || true
  wait "$backend_pid" "$frontend_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
wait "$backend_pid" "$frontend_pid"
