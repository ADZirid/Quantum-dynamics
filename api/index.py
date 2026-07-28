"""Point d'entrée Django pour Vercel."""
import os
import sys
from io import BytesIO

APP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app")
sys.path.insert(0, APP_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()


def handler(request):
    """WSGI handler for Vercel."""
    environ = {
        "REQUEST_METHOD": request.get("method", "GET"),
        "PATH_INFO": request.get("path", "/"),
        "SERVER_NAME": "vercel.app",
        "SERVER_PORT": "443",
        "QUERY_STRING": request.get("query", ""),
        "CONTENT_TYPE": request.get("headers", {}).get("content-type", ""),
        "CONTENT_LENGTH": request.get("headers", {}).get("content-length", "0"),
    }
    
    for key, value in request.get("headers", {}).items():
        environ[f"HTTP_{key.upper().replace('-', '_')}"] = value
    
    response_body = BytesIO()
    status = [None]
    response_headers = []
    
    def start_response(s, h, exc_info=None):
        status[0] = s
        response_headers.extend(h)
    
    result = application(environ, start_response)
    body = b"".join(result)
    
    return {
        "status": int(status[0].split(" ")[0]),
        "headers": dict(response_headers),
        "body": body.decode("utf-8", errors="replace"),
    }
