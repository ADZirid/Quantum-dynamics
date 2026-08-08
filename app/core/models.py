"""Modèles de données — Quantum Dynamics.

TOUS les modèles du site vivent ici (contrat GELÉ pour les agents suivants).
Les fichiers PDF (documents, newsletters) sont stockés via un FileField
(stockage interchangeable : disque local en dev / objet S3-compatible en prod)
et servis en streaming par core.views.serve_file.
"""
import uuid

from django.db import models


def _pdf_upload_to(instance, filename):
    """Nom de fichier régénéré (uuid4) pour éviter collisions et injections."""
    return f"pdf/{uuid.uuid4().hex}.pdf"


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


def _delete_file_on_delete(sender, instance, **kwargs):
    """Supprime le fichier stocké (local ou S3/B2) quand un objet est supprimé.

    Django ne supprime pas automatiquement le fichier d'un FileField : sans ce
    signal, les documents/newsletters supprimés laisseraient des orphelins dans
    le stockage (disque ou bucket Backblaze B2).
    """
    file = getattr(instance, "file", None)
    if file and file.name:
        try:
            file.storage.delete(file.name)
        except Exception:
            pass


models.signals.post_delete.connect(_delete_file_on_delete, sender=Document)
models.signals.post_delete.connect(_delete_file_on_delete, sender=Newsletter)
