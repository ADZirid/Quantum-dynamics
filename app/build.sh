#!/bin/bash
set -e

# Installer les dépendances
uv pip install --system -r requirements.txt

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Appliquer les migrations
python manage.py migrate --noinput
