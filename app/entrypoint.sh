#!/bin/sh
set -e

python manage.py collectstatic --noinput
python manage.py migrate --noinput
python manage.py bootstrap
exec gunicorn config.wsgi:application -b 0.0.0.0:${PORT:-3000} --workers 2 --timeout 60
