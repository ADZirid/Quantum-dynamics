#!/bin/bash
set -e

echo "=== STARTING ==="
echo "CWD: $(pwd)"
echo "DB path check:"
ls -la app/db.sqlite3 2>&1 || echo "No DB found"

echo "=== Running migrate ==="
python app/manage.py migrate --noinput

echo "=== Running bootstrap ==="
python app/manage.py bootstrap

echo "=== Checking DB after migrate ==="
python app/manage.py showmigrations --list 2>&1 | head -20

echo "=== Starting gunicorn ==="
exec gunicorn config.wsgi:application -b 0.0.0.0:$PORT --pythonpath app
