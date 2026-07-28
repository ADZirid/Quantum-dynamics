#!/bin/bash
set -e

# Installer les dépendances avec Python 3.12
uv pip install --system --python 3.12 -r requirements.txt

# Collecter les fichiers statiques
python3.12 manage.py collectstatic --noinput

# Appliquer les migrations
python3.12 manage.py migrate --noinput
