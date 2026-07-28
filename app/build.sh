#!/bin/bash
set -e

cd app

# Utiliser uv run qui trouve automatiquement le venv
uv run python manage.py collectstatic --noinput
uv run python manage.py migrate --noinput
