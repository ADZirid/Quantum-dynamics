"""Routage racine — Quantum Dynamics.

Chemins identiques à l'ancien site React (contrat gelé) :
/  /association/  /newsletter/  /newsletter/<pk>/  /documents/  /documents/<pk>/
/rejoindre/  /espace-membres/  /admin/ (dashboard custom)
/politique-de-confidentialite/  /cgu/
/fichiers/<kind>/<pk>/  /fichiers/<kind>/<pk>/telecharger/
"""
from django.urls import include, path

from core.views import download_file, serve_file

urlpatterns = [
    path("", include("website.urls")),
    path("", include("library.urls")),
    path("", include("accounts_app.urls")),
    path("fichiers/<str:kind>/<int:pk>/", serve_file, name="serve_file"),
    path(
        "fichiers/<str:kind>/<int:pk>/telecharger/",
        download_file,
        name="download_file",
    ),
]
