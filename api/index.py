"""Point d'entrée Django pour Vercel Serverless Functions."""
import os
import sys
from urllib.parse import parse_qs

APP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app")
sys.path.insert(0, APP_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()


class handler:
    """Vercel Serverless Function handler for Django WSGI."""
    
    def __init__(self, request):
        self.request = request
    
    async def __call__(self, scope, receive, send):
        """ASGI interface."""
        pass
