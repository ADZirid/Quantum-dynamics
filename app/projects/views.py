"""Vues publiques des projets — Quantum Dynamics.

- project_list   : grille des projets, filtre par domaine
- project_detail : fiche projet (couverture, description, galerie photos)
- project_image  : streaming des images (couverture / photo) depuis le stockage

Les images sont streamées par cette vue (comme les PDF via core.views) car le
bucket est privé : on ne peut pas s'appuyer sur un URL public du stockage.
"""
import os

from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404, render

from core.models import Project, ProjectPhoto

# Pastilles visuelles par domaine (mêmes couleurs que la page d'accueil).
DOMAIN_META = {
    Project.Domaine.TRANSPORTS: {
        "label": "Transports",
        "tag": "border-energy/30 bg-energy/10 text-energy",
        "dot": "bg-energy",
    },
    Project.Domaine.INDUSTRIE: {
        "label": "Industrie",
        "tag": "border-signal/40 bg-signal/10 text-signal-deep",
        "dot": "bg-signal",
    },
    Project.Domaine.ENERGIE: {
        "label": "Énergie",
        "tag": "border-[#5B6E8C]/30 bg-[#5B6E8C]/10 text-[#5B6E8C]",
        "dot": "bg-[#5B6E8C]",
    },
}

STATUT_LABELS = {
    Project.Statut.IDEE: "Idée",
    Project.Statut.EN_COURS: "En cours",
    Project.Statut.PROTOTYPE: "Prototype",
    Project.Statut.COMPETITION: "En compétition",
    Project.Statut.TERMINE: "Terminé",
}

# Cache public 1 h : les images ne changent que via l'admin.
CACHE_CONTROL = "public, max-age=3600"

_MIME = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
}


def project_list(request):
    """Grille des projets, filtrables par domaine."""
    domaine_param = request.GET.get("domaine", "").strip()
    domaine = domaine_param if domaine_param in Project.Domaine.values else ""

    projets = Project.objects.all()
    if domaine:
        projets = projets.filter(domaine=domaine)
    projets = list(projets)
    for projet in projets:
        projet.domaine_meta = DOMAIN_META[projet.domaine]

    domaines = [
        {
            "code": code,
            "label": label,
            "compteur": Project.objects.filter(domaine=code).count(),
            **DOMAIN_META[code],
        }
        for code, label in Project.Domaine.choices
    ]

    return render(
        request,
        "projects/project_list.html",
        {
            "projets": projets,
            "domaines": domaines,
            "domaine_actif": domaine,
            "total_projets": Project.objects.count(),
        },
    )


def project_detail(request, pk: int):
    """Fiche projet : couverture, description, statut, galerie."""
    projet = get_object_or_404(Project, pk=pk)
    projet.domaine_meta = DOMAIN_META[projet.domaine]
    return render(
        request,
        "projects/project_detail.html",
        {
            "projet": projet,
            "photos": projet.photos.all(),
            "statut_label": STATUT_LABELS[projet.statut],
        },
    )


def project_image(request, kind: str, pk: int):
    """Sert une image (couverture ou photo de galerie) en streaming."""
    if kind == "cover":
        objet = get_object_or_404(Project, pk=pk)
        stored = objet.cover
    elif kind == "photo":
        objet = get_object_or_404(ProjectPhoto, pk=pk)
        stored = objet.image
    else:
        raise Http404("Type d'image inconnu.")
    if not stored or not stored.name:
        raise Http404("Image absente.")

    content_type = _MIME.get(os.path.splitext(stored.name)[1].lower(), "application/octet-stream")
    stream = stored.open("rb")
    response = FileResponse(stream, content_type=content_type)
    response["X-Content-Type-Options"] = "nosniff"
    response["Cache-Control"] = CACHE_CONTROL
    return response
