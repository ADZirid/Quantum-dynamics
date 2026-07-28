#!/bin/bash
set -e

cd app

# Installer les dépendances globalement
uv pip install --system -r requirements.txt

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Appliquer les migrations
python manage.py migrate --noinput
