#!/bin/bash
set -e

# Activer le venv créé par installCommand
source ../.venv/bin/activate

cd app

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Appliquer les migrations
python manage.py migrate --noinput
