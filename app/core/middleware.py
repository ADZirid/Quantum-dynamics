"""Middlewares maison — Quantum Dynamics."""
from django.conf import settings


class ContentSecurityPolicyMiddleware:
    """Ajoute l'en-tête Content-Security-Policy (même politique que l'ancien site)."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response.headers.setdefault("Content-Security-Policy", settings.CSP_POLICY)
        return response
