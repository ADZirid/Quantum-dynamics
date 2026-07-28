"""Vercel Serverless Function — Django WSGI adapter."""
import os
import sys

APP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app")
sys.path.insert(0, APP_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application
from django.contrib.staticfiles.handlers import StaticFilesHandler

_django_app = StaticFilesHandler(get_wsgi_application())


def handler(request):
    """Vercel Python function handler."""
    method = request.get("method", "GET")
    path = request.get("path", "/")
    headers = request.get("headers", {})
    body = request.get("body", "")
    query = request.get("query", "")

    url = path
    if query:
        url = f"{path}?{query}"

    environ = {
        "REQUEST_METHOD": method,
        "PATH_INFO": path,
        "QUERY_STRING": query,
        "SERVER_NAME": "vercel.app",
        "SERVER_PORT": "443",
        "SERVER_PROTOCOL": "HTTPS/1.1",
        "wsgi.input": None,
        "wsgi.errors": sys.stderr,
        "wsgi.url_scheme": "https",
        "HTTP_HOST": headers.get("host", "vercel.app"),
        "RAW_URI": url,
    }

    for key, value in headers.items():
        environ[f"HTTP_{key.upper().replace('-', '_')}"] = str(value)

    if body:
        environ["wsgi.input"] = __import__("io").BytesIO(body.encode() if isinstance(body, str) else body)
        environ["CONTENT_LENGTH"] = str(len(body))

    status_code = [200]
    resp_headers = []

    def start_response(status, response_headers, exc_info=None):
        status_code[0] = int(status.split(" ")[0])
        resp_headers[:] = response_headers

    try:
        response_body = b"".join(_django_app(environ, start_response))
    except Exception as e:
        return {
            "status": 500,
            "headers": {"content-type": "text/plain"},
            "body": f"Internal Server Error: {e}",
        }

    return {
        "status": status_code[0],
        "headers": {k: v for k, v in resp_headers},
        "body": response_body.decode("utf-8", errors="replace"),
    }
