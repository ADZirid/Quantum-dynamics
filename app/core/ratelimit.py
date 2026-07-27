"""Rate limiting persistant en base (table core.RateLimitEntry).

Usage prévu (contrat gelé) :
- login        : consume(f"login:ip:{ip}", 5, 900) + consume(f"login:id:{identifiant}", 20, 900)
- candidatures : consume(f"candidature:ip:{ip}", 3, 3600) + consume("candidature:global", 30, 3600)

consume() renvoie True si l'appel est autorisé (le compteur est incrémenté),
False si le plafond est atteint pour la fenêtre en cours.
"""
from django.db import transaction
from django.utils import timezone

from core.models import RateLimitEntry


def consume(key: str, max: int, window_seconds: int) -> bool:  # noqa: A002 - nom imposé par le contrat
    """Consomme un jeton pour ``key`` dans une fenêtre glissante à départ fixe.

    Retourne True si l'action est autorisée, False si la limite est dépassée.
    """
    now = timezone.now()
    with transaction.atomic():
        entry = (
            RateLimitEntry.objects.select_for_update().filter(key=key).first()
        )
        if entry is None:
            entry = RateLimitEntry.objects.create(
                key=key, count=0, window_start=now
            )
        elapsed = (now - entry.window_start).total_seconds()
        if elapsed >= window_seconds:
            # Nouvelle fenêtre.
            entry.count = 0
            entry.window_start = now
        if entry.count >= max:
            entry.save(update_fields=["window_start", "count"])
            return False
        entry.count += 1
        entry.save(update_fields=["window_start", "count"])
        return True


def client_ip(request) -> str:
    """IP cliente (derrière proxy : X-Forwarded-For, première adresse)."""
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "inconnue")
