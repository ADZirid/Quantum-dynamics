#!/bin/bash
set -e

cd app

# Créer un environnement virtuel
uv venv

# Installer les dépendances dans le venv
uv pip install -r requirements.txt

# Collecter les fichiers statiques
uv run python manage.py collectstatic --noinput

# Appliquer les migrations
uv run python manage.py migrate --noinput
