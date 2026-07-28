#!/bin/bash
set -e

cd app

# Installer les dépendances
uv pip install -r requirements.txt

# Collecter les fichiers statiques
uv run python manage.py collectstatic --noinput

# Appliquer les migrations
uv run python manage.py migrate --noinput
