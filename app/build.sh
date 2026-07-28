#!/bin/bash
set -e

VENV_PYTHON="$(pwd)/.venv/bin/python"

cd app

"$VENV_PYTHON" manage.py collectstatic --noinput
"$VENV_PYTHON" manage.py migrate --noinput
