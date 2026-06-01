#!/usr/bin/env bash
# Render.com start script — binds to $PORT
set -o errexit
exec gunicorn dev_diva_quest.wsgi:application --bind "0.0.0.0:${PORT:-8000}" --workers 2 --timeout 120
