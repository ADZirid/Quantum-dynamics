"""Authentification + tableau de bord du bureau — Quantum Dynamics.

Sécurité :
- login rate-limité via core.ratelimit.consume (5/15 min par ip+identifiant,
  20/15 min par identifiant), message d'erreur générique anti-énumération ;
- toutes les vues du dashboard derrière @login_required, mutations en POST
  uniquement avec CSRF natif Django ;
- uploads PDF validés côté serveur (extension, magic bytes %PDF-, 15 Mo max),
  nom de fichier régénéré (uuid4), contenu stocké via FileField ;
- aucun filtre |safe sur des données utilisateur côté templates.
"""
import csv
import io
import os

from django.contrib import messages
from django.contrib.auth import authenticate, get_user_model, login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from core.models import (
    Application,
    Document,
    Member,
    Newsletter,
    Project,
    ProjectPhoto,
)
from core.ratelimit import client_ip, consume

User = get_user_model()

GENERIC_ERROR = "Identifiant ou mot de passe incorrect."
LOCKED_ERROR = "Trop de tentatives, réessayez dans quelques minutes."

MAX_PDF_SIZE = 15 * 1024 * 1024  # 15 Mo
PDF_MAGIC = b"%PDF-"
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 Mo
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

VALID_TABS = {
    "overview",
    "newsletter",
    "documents",
    "projets",
    "candidatures",
    "bureau",
    "utilisateurs",
    "securite",
}


# ---------------------------------------------------------------------------
# Authentification
# ---------------------------------------------------------------------------

def login_view(request):
    """Connexion réservée au bureau (anti-énumération + verrouillage)."""
    if request.user.is_authenticated:
        return redirect("accounts_app:dashboard")

    error = None
    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")
        ip = client_ip(request)

        allowed_ip = consume(f"login:{ip}:{username}", 5, 900)
        allowed_user = consume(f"login:user:{username}", 20, 900)
        if not (allowed_ip and allowed_user):
            error = LOCKED_ERROR
        else:
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect("accounts_app:dashboard")
            error = GENERIC_ERROR

    return render(request, "accounts/login.html", {"error": error})


def logout_view(request):
    """Déconnexion : POST uniquement, redirection vers l'accueil."""
    if request.method == "POST":
        logout(request)
    return redirect("website:home")


# ---------------------------------------------------------------------------
# Helpers dashboard
# ---------------------------------------------------------------------------

def _dashboard_url(tab: str) -> str:
    return f"/admin/?onglet={tab}"


def _validate_pdf(upload):
    """Validation stricte d'un PDF uploadé.

    Lit uniquement les 5 premiers octets (magic bytes %PDF-) puis restaure le
    pointeur de lecture. Retourne (None, message_erreur). Le contenu n'est pas
    lu en mémoire : le fichier est stocké directement via le FileField.
    """
    if upload is None:
        return None, "Veuillez joindre un fichier PDF."
    if upload.size > MAX_PDF_SIZE:
        return None, "Le fichier dépasse la taille maximale autorisée (15 Mo)."
    if not upload.name.lower().endswith(".pdf"):
        return None, "Le fichier n'est pas un PDF valide."
    upload.seek(0)
    if upload.file.read(len(PDF_MAGIC)) != PDF_MAGIC:
        upload.file.seek(0)
        return None, "Le fichier n'est pas un PDF valide."
    upload.file.seek(0)
    return None, None


def _validate_image(upload):
    """Validation stricte d'une image (couverture / galerie de projets).

    Vérifie l'extension, la taille (10 Mo max) puis décode réellement l'image
    avec Pillow (une simple extension ne garantit pas un vrai fichier image).
    Retourne (None, message_erreur).
    """
    if upload is None:
        return None, "Veuillez joindre une image (jpg, png, webp ou gif)."
    if upload.size > MAX_IMAGE_SIZE:
        return None, "L'image dépasse la taille maximale autorisée (10 Mo)."
    ext = os.path.splitext(upload.name)[1].lower()
    if ext not in IMAGE_EXTENSIONS:
        return None, "Le fichier n'est pas une image valide (jpg, png, webp, gif attendu)."
    try:
        from PIL import Image

        upload.seek(0)
        Image.open(upload).verify()
        upload.seek(0)
    except Exception:
        return None, "Le fichier n'est pas une image valide."
    return None, None


def _validate_photo_url(raw: str):
    """photo_url optionnelle ; vide = monogramme côté public."""
    raw = raw.strip()
    if not raw:
        return "", None
    try:
        URLValidator(schemes=["http", "https"])(raw)
    except ValidationError:
        return None, "L'URL de la photo n'est pas valide (http/https attendu)."
    return raw, None


def _validate_display_order(raw: str):
    try:
        value = int(raw.strip() or "0")
    except ValueError:
        return None, "L'ordre d'affichage doit être un nombre entier."
    if value < 0:
        return None, "L'ordre d'affichage doit être un nombre positif."
    return value, None


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

@login_required
def dashboard(request):
    """Tableau de bord du bureau — onglet actif via ?onglet= (défaut : overview)."""
    tab = request.GET.get("onglet", "overview")
    if tab not in VALID_TABS:
        tab = "overview"

    context = {
        "tab": tab,
        "tabs": [
            ("overview", "Vue d'ensemble"),
            ("newsletter", "Newsletter"),
            ("documents", "Documents"),
            ("projets", "Projets"),
            ("candidatures", "Candidatures"),
            ("bureau", "Bureau & membres"),
            ("utilisateurs", "Utilisateurs"),
            ("securite", "Sécurité"),
        ],
        "counts": {
            "newsletters": Newsletter.objects.count(),
            "documents": Document.objects.count(),
            "projets": Project.objects.count(),
            "candidatures_nouveau": Application.objects.filter(
                status=Application.Status.NOUVEAU
            ).count(),
            "membres": Member.objects.count(),
        },
        "dernieres_candidatures": Application.objects.all()[:5],
        "newsletters": Newsletter.objects.all(),
        "documents": Document.objects.all(),
        "document_categories": Document.Category.choices,
        "projets": Project.objects.all(),
        "projet_domaines": Project.Domaine.choices,
        "projet_statuts": Project.Statut.choices,
        "projet_photos": ProjectPhoto.objects.all(),
        "candidatures": Application.objects.all(),
        "candidature_statuses": Application.Status.choices,
        "filtre_statut": request.GET.get("statut", ""),
        "membres": Member.objects.all(),
        "utilisateurs": User.objects.all().order_by("-is_staff", "username"),
        "password_form": PasswordChangeForm(request.user),
    }

    filtre = context["filtre_statut"]
    if filtre in Application.Status.values:
        context["candidatures"] = context["candidatures"].filter(status=filtre)
    else:
        context["filtre_statut"] = ""

    return render(request, "accounts/dashboard.html", context)


# --- Newsletter -------------------------------------------------------------

@login_required
@require_POST
def newsletter_create(request):
    title = request.POST.get("title", "").strip()
    edition_raw = request.POST.get("edition", "").strip()
    summary = request.POST.get("summary", "").strip()
    published_at = request.POST.get("published_at", "").strip()

    if not title or not edition_raw or not published_at:
        messages.error(request, "Titre, édition et date de publication sont obligatoires.")
        return redirect(_dashboard_url("newsletter"))
    if len(summary) > 280:
        messages.error(request, "Le résumé ne doit pas dépasser 280 caractères.")
        return redirect(_dashboard_url("newsletter"))
    try:
        edition = int(edition_raw)
        if edition < 1:
            raise ValueError
    except ValueError:
        messages.error(request, "Le numéro d'édition doit être un entier positif.")
        return redirect(_dashboard_url("newsletter"))

    _, error = _validate_pdf(request.FILES.get("file"))
    if error:
        messages.error(request, error)
        return redirect(_dashboard_url("newsletter"))

    try:
        upload = request.FILES.get("file")
        newsletter = Newsletter(
            title=title,
            edition=edition,
            summary=summary,
            published_at=published_at,
            file=upload,
            file_size=upload.size,
        )
        newsletter.save()
    except (ValueError, ValidationError):
        messages.error(request, "La date de publication est invalide.")
        return redirect(_dashboard_url("newsletter"))
    messages.success(request, f"Newsletter « {title} » (édition {edition}) ajoutée.")
    return redirect(_dashboard_url("newsletter"))


@login_required
@require_POST
def newsletter_delete(request, pk):
    newsletter = get_object_or_404(Newsletter, pk=pk)
    titre = newsletter.title
    newsletter.delete()
    messages.success(request, f"Newsletter « {titre} » supprimée.")
    return redirect(_dashboard_url("newsletter"))


# --- Documents --------------------------------------------------------------

@login_required
@require_POST
def document_create(request):
    title = request.POST.get("title", "").strip()
    category = request.POST.get("category", "").strip()
    description = request.POST.get("description", "").strip()

    if not title:
        messages.error(request, "Le titre est obligatoire.")
        return redirect(_dashboard_url("documents"))
    if category not in Document.Category.values:
        messages.error(request, "La catégorie est invalide.")
        return redirect(_dashboard_url("documents"))

    _, error = _validate_pdf(request.FILES.get("file"))
    if error:
        messages.error(request, error)
        return redirect(_dashboard_url("documents"))

    upload = request.FILES.get("file")
    Document.objects.create(
        title=title,
        category=category,
        description=description,
        file=upload,
        file_size=upload.size,
    )
    messages.success(request, f"Document « {title} » ajouté.")
    return redirect(_dashboard_url("documents"))


@login_required
@require_POST
def document_update(request, pk):
    """Édition des métadonnées uniquement (le fichier n'est pas modifiable)."""
    document = get_object_or_404(Document, pk=pk)
    title = request.POST.get("title", "").strip()
    category = request.POST.get("category", "").strip()
    description = request.POST.get("description", "").strip()

    if not title:
        messages.error(request, "Le titre est obligatoire.")
        return redirect(_dashboard_url("documents"))
    if category not in Document.Category.values:
        messages.error(request, "La catégorie est invalide.")
        return redirect(_dashboard_url("documents"))

    document.title = title
    document.category = category
    document.description = description
    document.save(update_fields=["title", "category", "description"])
    messages.success(request, f"Document « {title} » mis à jour.")
    return redirect(_dashboard_url("documents"))


@login_required
@require_POST
def document_delete(request, pk):
    document = get_object_or_404(Document, pk=pk)
    titre = document.title
    document.delete()
    messages.success(request, f"Document « {titre} » supprimé.")
    return redirect(_dashboard_url("documents"))


# --- Projets ----------------------------------------------------------------

def _validate_date_texte(raw: str):
    """Date de publication : format aaaa-mm-jj, sinon message d'erreur."""
    from datetime import date

    try:
        return date.fromisoformat(raw.strip()), None
    except ValueError:
        return None, "La date de publication est invalide (format aaaa-mm-jj)."


@login_required
@require_POST
def project_create(request):
    title = request.POST.get("title", "").strip()
    summary = request.POST.get("summary", "").strip()
    description = request.POST.get("description", "").strip()
    domaine = request.POST.get("domaine", "").strip()
    statut = request.POST.get("statut", "").strip()
    display_order, err = _validate_display_order(request.POST.get("display_order", "0"))
    if err:
        messages.error(request, err)
        return redirect(_dashboard_url("projets"))
    published_at, err = _validate_date_texte(request.POST.get("published_at", ""))
    if err:
        messages.error(request, err)
        return redirect(_dashboard_url("projets"))

    if not title:
        messages.error(request, "Le titre est obligatoire.")
        return redirect(_dashboard_url("projets"))
    if len(summary) > 300:
        messages.error(request, "L'accroche ne doit pas dépasser 300 caractères.")
        return redirect(_dashboard_url("projets"))
    if not description:
        messages.error(request, "La description est obligatoire.")
        return redirect(_dashboard_url("projets"))
    if domaine not in Project.Domaine.values:
        messages.error(request, "Le domaine est invalide.")
        return redirect(_dashboard_url("projets"))
    if statut not in Project.Statut.values:
        messages.error(request, "Le statut est invalide.")
        return redirect(_dashboard_url("projets"))

    cover = request.FILES.get("cover")
    if cover:
        _, err = _validate_image(cover)
        if err:
            messages.error(request, err)
            return redirect(_dashboard_url("projets"))

    projet = Project(
        title=title,
        summary=summary,
        description=description,
        domaine=domaine,
        statut=statut,
        display_order=display_order,
        published_at=published_at,
    )
    if cover:
        projet.cover = cover
        projet.cover_size = cover.size
    projet.save()
    messages.success(request, f"Projet « {title} » ajouté.")
    return redirect(_dashboard_url("projets"))


@login_required
@require_POST
def project_update(request, pk):
    """Édition des métadonnées + remplacement éventuel de la couverture."""
    projet = get_object_or_404(Project, pk=pk)
    title = request.POST.get("title", "").strip()
    summary = request.POST.get("summary", "").strip()
    description = request.POST.get("description", "").strip()
    domaine = request.POST.get("domaine", "").strip()
    statut = request.POST.get("statut", "").strip()
    display_order, err = _validate_display_order(request.POST.get("display_order", "0"))
    if err:
        messages.error(request, err)
        return redirect(_dashboard_url("projets"))
    published_at, err = _validate_date_texte(request.POST.get("published_at", ""))
    if err:
        messages.error(request, err)
        return redirect(_dashboard_url("projets"))

    if not title:
        messages.error(request, "Le titre est obligatoire.")
        return redirect(_dashboard_url("projets"))
    if len(summary) > 300:
        messages.error(request, "L'accroche ne doit pas dépasser 300 caractères.")
        return redirect(_dashboard_url("projets"))
    if not description:
        messages.error(request, "La description est obligatoire.")
        return redirect(_dashboard_url("projets"))
    if domaine not in Project.Domaine.values:
        messages.error(request, "Le domaine est invalide.")
        return redirect(_dashboard_url("projets"))
    if statut not in Project.Statut.values:
        messages.error(request, "Le statut est invalide.")
        return redirect(_dashboard_url("projets"))

    cover = request.FILES.get("cover")
    if cover:
        _, err = _validate_image(cover)
        if err:
            messages.error(request, err)
            return redirect(_dashboard_url("projets"))

    projet.title = title
    projet.summary = summary
    projet.description = description
    projet.domaine = domaine
    projet.statut = statut
    projet.display_order = display_order
    projet.published_at = published_at
    if cover:
        if projet.cover and projet.cover.name:
            try:
                projet.cover.storage.delete(projet.cover.name)
            except Exception:
                pass
        projet.cover = cover
        projet.cover_size = cover.size
    projet.save()
    messages.success(request, f"Projet « {title} » mis à jour.")
    return redirect(_dashboard_url("projets"))


@login_required
@require_POST
def project_delete(request, pk):
    projet = get_object_or_404(Project, pk=pk)
    titre = projet.title
    projet.delete()
    messages.success(request, f"Projet « {titre} » supprimé.")
    return redirect(_dashboard_url("projets"))


@login_required
@require_POST
def project_photo_add(request, pk):
    """Ajoute une photo à la galerie d'un projet."""
    projet = get_object_or_404(Project, pk=pk)
    image = request.FILES.get("image")
    _, err = _validate_image(image)
    if err:
        messages.error(request, err)
        return redirect(_dashboard_url("projets"))
    caption = request.POST.get("caption", "").strip()
    if len(caption) > 200:
        messages.error(request, "La légende ne doit pas dépasser 200 caractères.")
        return redirect(_dashboard_url("projets"))
    display_order, err = _validate_display_order(request.POST.get("display_order", "0"))
    if err:
        messages.error(request, err)
        return redirect(_dashboard_url("projets"))

    ProjectPhoto.objects.create(
        project=projet,
        image=image,
        image_size=image.size,
        caption=caption,
        display_order=display_order,
    )
    messages.success(request, f"Photo ajoutée au projet « {projet.title} ».")
    return redirect(_dashboard_url("projets"))


@login_required
@require_POST
def project_photo_delete(request, pk):
    photo = get_object_or_404(ProjectPhoto, pk=pk)
    titre = photo.project.title
    photo.delete()
    messages.success(request, f"Photo supprimée du projet « {titre} ».")
    return redirect(_dashboard_url("projets"))


# --- Candidatures -----------------------------------------------------------

@login_required
@require_POST
def application_status(request, pk):
    application = get_object_or_404(Application, pk=pk)
    status = request.POST.get("status", "").strip()
    if status not in Application.Status.values:
        messages.error(request, "Le statut demandé est invalide.")
        return redirect(_dashboard_url("candidatures"))
    application.status = status
    application.save(update_fields=["status"])
    messages.success(
        request,
        f"Statut de la candidature de {application.first_name} {application.last_name} "
        f"passé à « {application.get_status_display()} ».",
    )
    filtre = request.POST.get("filtre", "")
    suffix = f"&statut={filtre}" if filtre in Application.Status.values else ""
    return redirect(_dashboard_url("candidatures") + suffix)


@login_required
def application_export(request):
    """Export CSV (UTF-8 BOM) des candidatures, filtrées comme sur le dashboard.

    Droits RGPD : accès et portabilité. GET uniquement (lecture seule).
    """
    filtre = request.GET.get("statut", "")
    applications = Application.objects.all().order_by("-created_at")
    if filtre in Application.Status.values:
        applications = applications.filter(status=filtre)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow([
        "Prénom", "Nom", "Email", "Études", "Motivation",
        "Statut", "Date", "Consentement", "IP consentement",
    ])
    for app in applications:
        writer.writerow([
            app.first_name,
            app.last_name,
            app.email,
            app.studies,
            app.motivation,
            app.get_status_display(),
            app.created_at.strftime("%d/%m/%Y %H:%M") if app.created_at else "",
            app.consent_at.strftime("%d/%m/%Y %H:%M") if app.consent_at else "",
            app.consent_ip or "",
        ])

    response = HttpResponse(
        "\ufeff" + buffer.getvalue(), content_type="text/csv; charset=utf-8"
    )
    response["Content-Disposition"] = "attachment; filename=candidatures.csv"
    return response


@login_required
@require_POST
def application_delete(request, pk):
    """Effacement d'une candidature (droit RGPD à l'effacement)."""
    application = get_object_or_404(Application, pk=pk)
    nom = f"{application.first_name} {application.last_name}"
    application.delete()
    messages.success(request, f"Candidature de {nom} supprimée.")
    filtre = request.POST.get("filtre", "")
    suffix = f"&statut={filtre}" if filtre in Application.Status.values else ""
    return redirect(_dashboard_url("candidatures") + suffix)


@login_required
@require_POST
def application_purge(request):
    """Purge RGPD : supprime les candidatures plus vieilles que la durée de
    conservation (settings.APPLICATION_RETENTION_DAYS) et les compteurs de
    rate-limiting expirés."""
    from datetime import timedelta

    from django.conf import settings as dj_settings
    from django.utils import timezone as dj_timezone

    from core.models import RateLimitEntry

    limite = dj_timezone.now() - timedelta(days=dj_settings.APPLICATION_RETENTION_DAYS)
    deleted = Application.objects.filter(created_at__lt=limite).delete()
    n = deleted[1].get("core.Application", 0) if isinstance(deleted, tuple) else deleted
    RateLimitEntry.objects.filter(
        window_start__lt=dj_timezone.now()
        - timedelta(days=dj_settings.RATELIMIT_RETENTION_DAYS)
    ).delete()
    messages.success(
        request,
        f"{n} candidature(s) de plus de {dj_settings.APPLICATION_RETENTION_DAYS} jours supprimée(s).",
    )
    return redirect(_dashboard_url("candidatures"))


# --- Bureau / membres -------------------------------------------------------

@login_required
@require_POST
def member_create(request):
    name = request.POST.get("name", "").strip()
    role = request.POST.get("role", "").strip()
    bio = request.POST.get("bio", "").strip()
    photo_url, err = _validate_photo_url(request.POST.get("photo_url", ""))
    if err:
        messages.error(request, err)
        return redirect(_dashboard_url("bureau"))
    display_order, err = _validate_display_order(request.POST.get("display_order", "0"))
    if err:
        messages.error(request, err)
        return redirect(_dashboard_url("bureau"))
    if not name or not role:
        messages.error(request, "Nom et rôle sont obligatoires.")
        return redirect(_dashboard_url("bureau"))

    Member.objects.create(
        name=name, role=role, bio=bio,
        photo_url=photo_url, display_order=display_order,
    )
    messages.success(request, f"Membre « {name} » ajouté au bureau.")
    return redirect(_dashboard_url("bureau"))


@login_required
@require_POST
def member_update(request, pk):
    member = get_object_or_404(Member, pk=pk)
    name = request.POST.get("name", "").strip()
    role = request.POST.get("role", "").strip()
    bio = request.POST.get("bio", "").strip()
    photo_url, err = _validate_photo_url(request.POST.get("photo_url", ""))
    if err:
        messages.error(request, err)
        return redirect(_dashboard_url("bureau"))
    display_order, err = _validate_display_order(request.POST.get("display_order", "0"))
    if err:
        messages.error(request, err)
        return redirect(_dashboard_url("bureau"))
    if not name or not role:
        messages.error(request, "Nom et rôle sont obligatoires.")
        return redirect(_dashboard_url("bureau"))

    member.name = name
    member.role = role
    member.bio = bio
    member.photo_url = photo_url
    member.display_order = display_order
    member.save(update_fields=["name", "role", "bio", "photo_url", "display_order"])
    messages.success(request, f"Membre « {name} » mis à jour.")
    return redirect(_dashboard_url("bureau"))


@login_required
@require_POST
def member_delete(request, pk):
    member = get_object_or_404(Member, pk=pk)
    nom = member.name
    member.delete()
    messages.success(request, f"Membre « {nom} » supprimé.")
    return redirect(_dashboard_url("bureau"))


# --- Utilisateurs ------------------------------------------------------------

@login_required
@require_POST
def user_create(request):
    """Créer un nouveau compte staff."""
    username = request.POST.get("username", "").strip()
    email = request.POST.get("email", "").strip()
    password = request.POST.get("password", "")

    if not username or not password:
        messages.error(request, "Identifiant et mot de passe sont obligatoires.")
        return redirect(_dashboard_url("utilisateurs"))
    if len(password) < 12:
        messages.error(request, "Le mot de passe doit contenir au moins 12 caractères.")
        return redirect(_dashboard_url("utilisateurs"))
    if User.objects.filter(username=username).exists():
        messages.error(request, f"Le nom d'utilisateur « {username} » existe déjà.")
        return redirect(_dashboard_url("utilisateurs"))

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_staff=True,
    )
    messages.success(request, f"Compte staff « {username} » créé avec succès.")
    return redirect(_dashboard_url("utilisateurs"))


@login_required
@require_POST
def user_delete(request, pk):
    """Supprimer un compte staff (pas soi-même)."""
    user_to_delete = get_object_or_404(User, pk=pk)
    if user_to_delete.pk == request.user.pk:
        messages.error(request, "Vous ne pouvez pas supprimer votre propre compte.")
        return redirect(_dashboard_url("utilisateurs"))
    if not user_to_delete.is_staff:
        messages.error(request, "Ce compte n'est pas un compte staff.")
        return redirect(_dashboard_url("utilisateurs"))
    username = user_to_delete.username
    user_to_delete.delete()
    messages.success(request, f"Compte « {username} » supprimé.")
    return redirect(_dashboard_url("utilisateurs"))


@login_required
@require_POST
def user_reset_password(request, pk):
    """Réinitialiser le mot de passe d'un compte staff."""
    user_to_reset = get_object_or_404(User, pk=pk)
    new_password = request.POST.get("new_password", "")

    if not user_to_reset.is_staff:
        messages.error(request, "Ce compte n'est pas un compte staff.")
        return redirect(_dashboard_url("utilisateurs"))
    if len(new_password) < 12:
        messages.error(request, "Le mot de passe doit contenir au moins 12 caractères.")
        return redirect(_dashboard_url("utilisateurs"))

    user_to_reset.set_password(new_password)
    user_to_reset.save()
    messages.success(request, f"Mot de passe de « {user_to_reset.username } » réinitialisé.")
    return redirect(_dashboard_url("utilisateurs"))


# --- Sécurité ---------------------------------------------------------------

@login_required
@require_POST
def password_change(request):
    form = PasswordChangeForm(request.user, request.POST)
    new1 = request.POST.get("new_password1", "")
    # Exigence client : 12 caractères minimum (settings par défaut : 8,
    # renforcé ici côté vue — cf. rapport pour alignement des settings).
    if len(new1) < 12:
        messages.error(
            request,
            "Le nouveau mot de passe doit contenir au moins 12 caractères.",
        )
        return redirect(_dashboard_url("securite"))
    if form.is_valid():
        user = form.save()
        update_session_auth_hash(request, user)  # garde la session active
        messages.success(request, "Mot de passe mis à jour.")
        return redirect(_dashboard_url("securite"))
    for errors in form.errors.values():
        for error in errors:
            messages.error(request, error)
    return redirect(_dashboard_url("securite"))
