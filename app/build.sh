#!/bin/bash
set -e

cd app

# Créer le venv à la racine du projet (accessible au runtime)
cd ..
uv venv .venv --python 3.12 2>/dev/null || uv venv .venv
source .venv/bin/activate

cd app

# Installer les dépendances
uv pip install -r requirements.txt

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Appliquer les migrations
python manage.py migrate --noinput
