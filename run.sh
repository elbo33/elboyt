#!/usr/bin/env bash
# Sets up the venv (first run only) and starts the web app.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

PYTHON=python3
if command -v python3.10 >/dev/null 2>&1; then
  # Homebrew's python3.11/python3.14 currently ship a broken pyexpat
  # (libexpat version mismatch) that makes `venv`/ensurepip fail; 3.10 works.
  PYTHON=python3.10
fi

if [ ! -d venv ]; then
  echo "Creating venv with $PYTHON..."
  "$PYTHON" -m venv venv
fi

source venv/bin/activate

# Skip reinstalling deps when nothing changed, and never let pip keep a
# local wheel/download cache around (that's what eats disk over time).
export PIP_NO_CACHE_DIR=1
DEPS_HASH=$(cat requirements.txt requirements-dev.txt | shasum -a 256 | cut -d' ' -f1)
if [ ! -f venv/.deps-hash ] || [ "$(cat venv/.deps-hash)" != "$DEPS_HASH" ]; then
  echo "Installing dependencies..."
  pip install -q -r requirements-dev.txt
  echo "$DEPS_HASH" > venv/.deps-hash
fi

exec python -m uvicorn webapp.app:app --app-dir webapp --reload
