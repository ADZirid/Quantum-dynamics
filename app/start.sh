#!/bin/bash
set -e

cd /opt/render/project/src/app

python manage.py migrate --noinput

exec gunicorn config.wsgi:application -b 0.0.0.0:$PORT --workers 2 --timeout 60
