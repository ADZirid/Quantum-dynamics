"""Modèles de données — Quantum Dynamics.

TOUS les modèles du site vivent ici (contrat GELÉ pour les agents suivants).
Les fichiers PDF (documents, newsletters) sont stockés via un FileField
(stockage interchangeable : disque local en dev / objet S3-compatible en prod)
et servis en streaming par core.views.serve_file.
"""
import os
import uuid

from django.db import models


def _pdf_upload_to(instance, filename):
    """Nom de fichier régénéré (uuid4) pour éviter collisions et injections."""
    return f"pdf/{uuid.uuid4().hex}.pdf"


def _image_upload_to(instance, filename):
    """Image (couverture ou galerie) : nom uuid4, extension d'origine conservée."""
    ext = os.path.splitext(filename)[1].lower() or ".png"
    return f"projets/{uuid.uuid4().hex}{ext}"


class Member(models.Model):
    """Membre du bureau / de l'équipe, affiché sur la page association."""

    name = models.CharField("nom", max_length=120)
    role = models.CharField("rôle", max_length=120)
    bio = models.TextField("bio", blank=True)
    # Vide => monogramme (initiales) généré côté template.
    photo_url = models.URLField("photo", blank=True)
    display_order = models.PositiveIntegerField("ordre d'affichage", default=0)

    class Meta:
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return f"{self.name} — {self.role}"


class Document(models.Model):
    """Document officiel téléchargeable (PDF stocké en base)."""

    class Category(models.TextChoices):
        PV = "pv", "Procès-verbal"
        AG = "ag", "Assemblée générale"
        PARTENARIAT = "partenariat", "Partenariat"
        COMPTABILITE = "comptabilite", "Comptabilité"
        DIVERS = "divers", "Divers"

    title = models.CharField("titre", max_length=200)
    category = models.CharField(
        "catégorie", max_length=20, choices=Category.choices, default=Category.DIVERS
    )
    description = models.TextField("description", blank=True)
    file = models.FileField("fichier", upload_to=_pdf_upload_to)
    # Taille en octets, mise en cache à l'upload (évite un HEAD stockage par ligne).
    file_size = models.PositiveIntegerField("taille (octets)", default=0)
    created_at = models.DateTimeField("créé le", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def file_name(self):
        """Nom de base du fichier (sans le préfixe de répertoire)."""
        return self.file.name.rsplit("/", 1)[-1] if self.file else ""

    def __str__(self) -> str:
        return self.title


class Newsletter(models.Model):
    """Édition de la newsletter (PDF stocké en base)."""

    title = models.CharField("titre", max_length=200)
    edition = models.PositiveIntegerField("numéro d'édition", default=1)
    summary = models.TextField("résumé", blank=True)
    file = models.FileField("fichier", upload_to=_pdf_upload_to)
    # Taille en octets, mise en cache à l'upload (évite un HEAD stockage par ligne).
    file_size = models.PositiveIntegerField("taille (octets)", default=0)
    published_at = models.DateField("publié le")
    created_at = models.DateTimeField("créé le", auto_now_add=True)

    class Meta:
        ordering = ["-published_at", "-edition"]

    @property
    def file_name(self):
        """Nom de base du fichier (sans le préfixe de répertoire)."""
        return self.file.name.rsplit("/", 1)[-1] if self.file else ""

    def __str__(self) -> str:
        return f"Édition {self.edition} — {self.title}"


class Project(models.Model):
    """Projet de l'association, présenté sur la section « Projets »."""

    class Domaine(models.TextChoices):
        TRANSPORTS = "transports", "Transports"
        INDUSTRIE = "industrie", "Industrie"
        ENERGIE = "energie", "Énergie"

    class Statut(models.TextChoices):
        IDEE = "idee", "Idée"
        EN_COURS = "en_cours", "En cours"
        PROTOTYPE = "prototype", "Prototype"
        COMPETITION = "competition", "En compétition"
        TERMINE = "termine", "Terminé"

    title = models.CharField("titre", max_length=200)
    summary = models.CharField("accroche", max_length=300)
    description = models.TextField("description")
    domaine = models.CharField(
        "domaine", max_length=20, choices=Domaine.choices
    )
    statut = models.CharField(
        "statut", max_length=20, choices=Statut.choices, default=Statut.IDEE
    )
    # Couverture : vide => visuel de remplacement (numéro de projet) côté template.
    cover = models.ImageField(
        "image de couverture", upload_to=_image_upload_to, blank=True
    )
    # Taille en octets, mise en cache à l'upload (évite un HEAD stockage par ligne).
    cover_size = models.PositiveIntegerField("taille (octets)", default=0)
    display_order = models.PositiveIntegerField("ordre d'affichage", default=0)
    published_at = models.DateField("publié le")
    created_at = models.DateTimeField("créé le", auto_now_add=True)

    class Meta:
        ordering = ["display_order", "-published_at"]

    def __str__(self) -> str:
        return self.title


class ProjectPhoto(models.Model):
    """Photo de la galerie d'un projet."""

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="photos"
    )
    image = models.ImageField("image", upload_to=_image_upload_to)
    image_size = models.PositiveIntegerField("taille (octets)", default=0)
    caption = models.CharField("légende", max_length=200, blank=True)
    display_order = models.PositiveIntegerField("ordre d'affichage", default=0)

    class Meta:
        ordering = ["display_order", "pk"]

    def __str__(self) -> str:
        return f"Photo — {self.project.title}"


class Application(models.Model):
    """Candidature d'adhésion envoyée depuis le formulaire « Rejoindre »."""

    class Status(models.TextChoices):
        NOUVEAU = "nouveau", "Nouveau"
        EN_COURS = "en_cours", "En cours"
        ACCEPTE = "accepte", "Accepté"
        REFUSE = "refuse", "Refusé"

    first_name = models.CharField("prénom", max_length=120)
    last_name = models.CharField("nom", max_length=120)
    email = models.EmailField("e-mail")
    studies = models.CharField("filière / études", max_length=200)
    motivation = models.TextField("motivation")
    # Preuve RGPD (art. 7) : horodatage + IP au moment du consentement.
    consent_at = models.DateTimeField("consentement donné le", null=True, blank=True)
    consent_ip = models.GenericIPAddressField(
        "IP au moment du consentement", null=True, blank=True
    )
    status = models.CharField(
        "statut", max_length=20, choices=Status.choices, default=Status.NOUVEAU
    )
    created_at = models.DateTimeField("créé le", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} ({self.get_status_display()})"


class RateLimitEntry(models.Model):
    """Compteur de rate limiting en base (cf. core.ratelimit.consume)."""

    key = models.CharField("clé", max_length=255, unique=True)
    count = models.PositiveIntegerField("compteur", default=0)
    window_start = models.DateTimeField("début de fenêtre")

    def __str__(self) -> str:
        return f"{self.key} ({self.count})"


def _make_file_deleter(field_name: str):
    """Fabrique un gestionnaire post_delete qui supprime le fichier stocké
    (local ou S3/B2) d'un champ FileField/ImageField.

    Django ne supprime pas automatiquement le fichier d'un FileField : sans ce
    signal, les objets supprimés laisseraient des orphelins dans le stockage
    (disque ou bucket Backblaze B2).
    """

    def deleter(sender, instance, **kwargs):
        stored = getattr(instance, field_name, None)
        if stored and stored.name:
            try:
                stored.storage.delete(stored.name)
            except Exception:
                pass

    return deleter


_delete_file_on_delete = _make_file_deleter("file")
_delete_cover_on_delete = _make_file_deleter("cover")
_delete_image_on_delete = _make_file_deleter("image")

models.signals.post_delete.connect(_delete_file_on_delete, sender=Document)
models.signals.post_delete.connect(_delete_file_on_delete, sender=Newsletter)
models.signals.post_delete.connect(_delete_cover_on_delete, sender=Project)
models.signals.post_delete.connect(_delete_image_on_delete, sender=ProjectPhoto)
