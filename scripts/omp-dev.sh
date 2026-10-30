#!/usr/bin/env bash
# Launch omp with the Developer persona.
# Usage: ./scripts/omp-dev.sh [any omp flags]
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec omp \
  --config "$here/persona-dev.yml" \
  --append-system-prompt "$here/persona-dev-prompt.md" \
  "$@"