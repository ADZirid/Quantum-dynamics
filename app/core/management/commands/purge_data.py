"""Purge RGPD des données personnelles arrivées à échéance.

- Application : suppression des candidatures de plus de
  settings.APPLICATION_RETENTION_DAYS jours (défaut : 365, soit 12 mois).
- RateLimitEntry : suppression des compteurs expirés (IP conservées au-delà de
  la fenêtre d'utilisation) après settings.RATELIMIT_RETENTION_DAYS jours.

Usage : python manage.py purge_data
"""
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import Application, RateLimitEntry


class Command(BaseCommand):
    help = "Supprime les données personnelles arrivées à échéance (RGPD)."

    def handle(self, *args, **options):
        app_days = settings.APPLICATION_RETENTION_DAYS
        limite_app = timezone.now() - timedelta(days=app_days)
        deleted = Application.objects.filter(created_at__lt=limite_app).delete()
        n_apps = deleted[1].get("core.Application", 0) if isinstance(deleted, tuple) else deleted
        self.stdout.write(
            self.style.SUCCESS(
                f"Candidatures supprimées (plus de {app_days} jours) : {n_apps}"
            )
        )

        rl_days = settings.RATELIMIT_RETENTION_DAYS
        limite_rl = timezone.now() - timedelta(days=rl_days)
        deleted = RateLimitEntry.objects.filter(
            window_start__lt=limite_rl
        ).delete()
        n_rl = deleted[1].get("core.RateLimitEntry", 0) if isinstance(deleted, tuple) else deleted
        self.stdout.write(
            self.style.SUCCESS(
                f"Compteurs de rate-limiting purgés (plus de {rl_days} jours) : {n_rl}"
            )
        )
