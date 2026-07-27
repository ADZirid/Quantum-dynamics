"""Crée le compte bureau initial si aucun staff n'existe.

Les migrations sont appliquées par entrypoint.sh avant cette commande.
Mot de passe : env ADMIN_PASSWORD, sinon valeur par défaut + warning sécurité.
"""
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

DEFAULT_PASSWORD = "K6CctXHX3Z7tKX5dQd1"


class Command(BaseCommand):
    help = "Crée le superuser/staff 'bureau' si aucun compte staff n'existe."

    def handle(self, *args, **options):
        User = get_user_model()
        if User.objects.filter(is_staff=True).exists():
            self.stdout.write("bootstrap : un compte staff existe déjà, rien à faire.")
            return

        password = os.environ.get("ADMIN_PASSWORD", "").strip()
        if not password:
            password = DEFAULT_PASSWORD
            self.stderr.write(
                self.style.WARNING(
                    "⚠ SÉCURITÉ : mot de passe par défaut utilisé pour le compte "
                    "'bureau' — changez ce mot de passe immédiatement "
                    "(variable d'environnement ADMIN_PASSWORD)."
                )
            )

        User.objects.create_superuser(
            username="bureau",
            email="quantumdynamics.asso@gmail.com",
            password=password,
        )
        self.stdout.write(
            self.style.SUCCESS("bootstrap : compte staff 'bureau' créé.")
        )
