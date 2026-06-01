#!/usr/bin/env bash
# Render.com build script — backend/
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate --noinput
python manage.py create_admin
