"""Crée le compte bureau initial si aucun staff n'existe.

Les migrations sont appliquées avant cette commande.
Mot de passe : obligatoire via la variable d'environnement ADMIN_PASSWORD.
Aucun mot de passe par défaut n'est codé en dur pour ne pas exposer un secret
dans le dépôt public.
"""
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Crée le superuser/staff 'bureau' si aucun compte staff n'existe."

    def handle(self, *args, **options):
        User = get_user_model()
        if User.objects.filter(is_staff=True).exists():
            self.stdout.write("bootstrap : un compte staff existe déjà, rien à faire.")
            return

        password = os.environ.get("ADMIN_PASSWORD", "").strip()
        if not password:
            raise CommandError(
                "Aucun compte staff n'existe et la variable d'environnement "
                "ADMIN_PASSWORD n'est pas définie. Définissez ADMIN_PASSWORD "
                "(12 caractères minimum) pour créer le compte 'bureau'."
            )
        if len(password) < 12:
            raise CommandError(
                "ADMIN_PASSWORD doit contenir au moins 12 caractères."
            )

        User.objects.create_superuser(
            username="bureau",
            email="quantumdynamics.asso@gmail.com",
            password=password,
        )
        self.stdout.write(
            self.style.SUCCESS("bootstrap : compte staff 'bureau' créé.")
        )
