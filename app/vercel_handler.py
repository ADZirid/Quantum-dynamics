"""Handler WSGI pour Vercel Serverless Functions."""
import os
import sys

# Ajouter le dossier app au path
sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

# Vercel attend une fonction handler
def handler(request, response):
    return application(request, response)
