"""Vercel Serverless Function — Django WSGI adapter."""
import os
import sys
from io import BytesIO

PROJECT_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
APP_DIR = os.path.join(PROJECT_ROOT, "app")
VENV_SITE = os.path.join(PROJECT_ROOT, ".venv", "lib", "python3.12", "site-packages")

if os.path.isdir(VENV_SITE):
    sys.path.insert(0, VENV_SITE)
sys.path.insert(0, APP_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application
from django.contrib.staticfiles.handlers import StaticFilesHandler

app = StaticFilesHandler(get_wsgi_application())


def handler(request):
    """Vercel Python function handler."""
    method = request.get("method", "GET")
    path = request.get("path", "/")
    headers = request.get("headers", {})
    body = request.get("body", "")
    query = request.get("query", "")

    environ = {
        "REQUEST_METHOD": method,
        "PATH_INFO": path,
        "QUERY_STRING": query,
        "SERVER_NAME": "vercel.app",
        "SERVER_PORT": "443",
        "SERVER_PROTOCOL": "HTTPS/1.1",
        "wsgi.input": BytesIO(body.encode() if isinstance(body, str) else (body or b"")),
        "wsgi.errors": sys.stderr,
        "wsgi.url_scheme": "https",
        "HTTP_HOST": headers.get("host", "vercel.app"),
        "RAW_URI": f"{path}?{query}" if query else path,
        "CONTENT_LENGTH": str(len(body)) if body else "0",
    }

    for key, value in headers.items():
        environ[f"HTTP_{key.upper().replace('-', '_')}"] = str(value)

    status_line = ["200 OK"]
    resp_headers = []

    def start_response(status, response_headers, exc_info=None):
        status_line[0] = status
        resp_headers[:] = response_headers

    try:
        response_body = b"".join(app(environ, start_response))
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"content-type": "text/plain"},
            "body": f"Internal Server Error: {e}",
        }

    code = int(status_line[0].split(" ")[0])
    return {
        "statusCode": code,
        "headers": {k: v for k, v in resp_headers},
        "body": response_body.decode("utf-8", errors="replace"),
    }
