"""Vues newsletter + documents — Quantum Dynamics.

- newsletter_list : édition à la une + archives paginées (9/page), filtre année
- newsletter_detail : lecteur PDF intégré + navigation précédente/suivante
- document_list : recherche serveur (?q=), catégories multi (?categorie=),
  tri (?tri=recent|ancien|az|za)
- document_detail : même lecteur, tag de catégorie coloré

Les PDF sont streamés par core.views (serve_file inline / download_file
attachment) ; ces vues ne manipulent jamais le contenu binaire.
"""
from django.core.paginator import Paginator
from django.db.models import Count
from django.db.models.functions import Lower
from django.shortcuts import render

from core.models import Document, Newsletter

# Pastilles couleur par catégorie (contrat visuel de l'ancien site) :
# PV energy / AG ink-2 / Partenariats signal / Comptabilité #5B6E8C / Divers ink-3.
CATEGORY_META = {
    Document.Category.PV: {
        "label": "Procès-verbal",
        "short": "PV",
        "tag": "border-energy/30 bg-energy/10 text-energy",
        "dot": "bg-energy",
    },
    Document.Category.AG: {
        "label": "Assemblée générale",
        "short": "AG",
        "tag": "border-ink-2/30 bg-ink-2/10 text-ink-2",
        "dot": "bg-ink-2",
    },
    Document.Category.PARTENARIAT: {
        "label": "Partenariat",
        "short": "Partenariat",
        "tag": "border-signal/40 bg-signal/10 text-signal-deep",
        "dot": "bg-signal",
    },
    Document.Category.COMPTABILITE: {
        "label": "Comptabilité",
        "short": "Compta",
        "tag": "border-[#5B6E8C]/30 bg-[#5B6E8C]/10 text-[#5B6E8C]",
        "dot": "bg-[#5B6E8C]",
    },
    Document.Category.DIVERS: {
        "label": "Divers",
        "short": "Divers",
        "tag": "border-ink-3/30 bg-ink-3/10 text-ink-3",
        "dot": "bg-ink-3",
    },
}

TRIS = {
    "recent": ("-created_at",),
    "ancien": ("created_at",),
    "az": (Lower("title"),),
    "za": (Lower("title").desc(),),
}

EDITIONS_PAR_PAGE = 9


def newsletter_list(request):
    """Journal de l'atelier : une à la une + grille d'archives."""
    editions = Newsletter.objects.defer("file_data")
    featured = editions.first()

    annee_param = request.GET.get("annee", "").strip()
    annee = int(annee_param) if annee_param.isdigit() else None

    archives = editions.filter(published_at__year=annee) if annee else editions
    paginator = Paginator(archives, EDITIONS_PAR_PAGE)
    page_obj = paginator.get_page(request.GET.get("page"))

    annees = [d.year for d in editions.dates("published_at", "year", order="DESC")]

    return render(
        request,
        "library/newsletter_list.html",
        {
            "featured": featured,
            "page_obj": page_obj,
            "annees": annees,
            "annee_courante": annee,
            "total_editions": editions.count(),
            "restantes": max(paginator.count - page_obj.end_index(), 0),
        },
    )


def newsletter_detail(request, pk: int):
    """Lecteur d'édition : barre d'outils sticky + iframe PDF + nav prev/next."""
    edition = Newsletter.objects.defer("file_data").filter(pk=pk).first()
    if edition is None:
        return render(
            request,
            "library/newsletter_detail.html",
            {"edition": None},
            status=404,
        )

    # Précédente = plus ancienne, suivante = plus récente (même convention que
    # l'ancien site : liste triée de la plus récente à la plus ancienne).
    nav = list(Newsletter.objects.defer("file_data"))
    index = next((i for i, n in enumerate(nav) if n.pk == edition.pk), -1)
    precedente = nav[index + 1] if 0 <= index < len(nav) - 1 else None
    suivante = nav[index - 1] if index > 0 else None

    return render(
        request,
        "library/newsletter_detail.html",
        {
            "edition": edition,
            "precedente": precedente,
            "suivante": suivante,
        },
    )


def document_list(request):
    """Documents officiels : recherche serveur + catégories à cocher + tri."""
    tous_les_codes = [code for code, _ in Document.Category.choices]

    # « soumis » (champ caché du formulaire) distingue « aucun filtre demandé »
    # (= toutes catégories) de « toutes les cases décochées » (= aucun résultat).
    soumis = "soumis" in request.GET or "categorie" in request.GET
    selection = [c for c in request.GET.getlist("categorie") if c in tous_les_codes]
    if not soumis:
        selection = list(tous_les_codes)

    q = request.GET.get("q", "").strip()
    tri = request.GET.get("tri", "recent")
    if tri not in TRIS:
        tri = "recent"

    total_publies = Document.objects.count()
    compteurs = {
        row["category"]: row["n"]
        for row in Document.objects.values("category").annotate(n=Count("pk"))
    }

    documents = Document.objects.defer("file_data")
    if soumis and not selection:
        documents = documents.none()
    elif selection and set(selection) != set(tous_les_codes):
        documents = documents.filter(category__in=selection)
    if q:
        # L'ORM échappe les jokers LIKE (% et _) du paramètre : recherche littérale.
        documents = documents.filter(title__icontains=q)
    documents = list(documents.order_by(*TRIS[tri]))
    for doc in documents:
        doc.meta = CATEGORY_META[doc.category]

    filtres_actifs = bool(q) or set(selection) != set(tous_les_codes)
    resume_parts = []
    if q:
        resume_parts.append(f"recherche « {q} »")
    if set(selection) != set(tous_les_codes):
        if selection:
            labels = ", ".join(CATEGORY_META[c]["short"] for c in tous_les_codes if c in selection)
            resume_parts.append(f"catégories : {labels}")
        else:
            resume_parts.append("aucune catégorie")

    categories = [
        {"code": code, "compteur": compteurs.get(code, 0), **CATEGORY_META[code]}
        for code in tous_les_codes
    ]

    return render(
        request,
        "library/document_list.html",
        {
            "documents": documents,
            "categories": categories,
            "selection": selection,
            "q": q,
            "tri": tri,
            "filtres_actifs": filtres_actifs,
            "resume_filtres": " · ".join(resume_parts),
            "total_publies": total_publies,
        },
    )


def document_detail(request, pk: int):
    """Lecteur de document : même shell que la newsletter + tag catégorie."""
    document = Document.objects.defer("file_data").filter(pk=pk).first()
    if document is None:
        return render(
            request,
            "library/document_detail.html",
            {"document": None},
            status=404,
        )
    return render(
        request,
        "library/document_detail.html",
        {
            "document": document,
            "meta": CATEGORY_META[document.category],
        },
    )
