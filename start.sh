#!/bin/bash
set -ex

echo "=== Running migrate ==="
python app/manage.py migrate --noinput
echo "=== Migrate done ==="

echo "=== Starting gunicorn ==="
exec gunicorn config.wsgi:application -b 0.0.0.0:$PORT --pythonpath app --workers 2 --timeout 60
