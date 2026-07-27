"""Vues des pages publiques — Quantum Dynamics."""
import re

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.shortcuts import render

from core.models import Application, Member, Newsletter
from core.ratelimit import client_ip, consume

# Même motif que l'ancienne validation client React (lettres, espaces, tirets,
# apostrophes — accents compris).
NAME_PATTERN = re.compile(r"^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$")

# Cartes neutres affichées tant qu'aucun membre n'est enregistré
# (aucun nom, aucune photo inventée).
BUREAU_PLACEHOLDERS = [
    {"role": "Président·e", "initiales": "PR"},
    {"role": "Vice-président·e", "initiales": "VP"},
    {"role": "Trésorier·ère", "initiales": "TR"},
    {"role": "Secrétaire", "initiales": "SE"},
    {"role": "Responsable technique", "initiales": "RT"},
    {"role": "Chargé·e de communication", "initiales": "CC"},
]


def home(request):
    """Accueil : reproduit fidèlement l'ancienne page React (Home.tsx).

    L'aperçu newsletter affiche les 3 dernières éditions, ou l'état vide
    prévu par le design (« La première édition arrive bientôt. »).
    """
    editions = Newsletter.objects.all()[:3]
    return render(request, "website/home.html", {"editions": editions})


def _initiales(name: str) -> str:
    """Monogramme (2 premières initiales) pour les membres sans photo."""
    parts = name.split()
    return "".join(part[0] for part in parts[:2]).upper() or "?"


def association(request):
    """Page « L'association » : mission, domaines, démarche, bureau.

    Le bureau est dynamique (Member trié par display_order). Sans membre
    enregistré, des cartes placeholder neutres sont affichées.
    """
    members = list(Member.objects.all())
    for member in members:
        member.initiales = _initiales(member.name)
    return render(
        request,
        "website/association.html",
        {"members": members, "placeholders": BUREAU_PLACEHOLDERS},
    )


def _validate_candidature(values: dict, consent: bool) -> dict:
    """Validation serveur du formulaire de candidature (messages français)."""
    errors = {}
    for field, label in (("last_name", "nom"), ("first_name", "prénom")):
        value = values[field]
        if not value:
            errors[field] = f"Merci d'indiquer votre {label}."
        elif not 2 <= len(value) <= 80:
            errors[field] = f"Le {label} doit contenir entre 2 et 80 caractères."
        elif not NAME_PATTERN.match(value):
            errors[field] = (
                f"Le {label} ne doit contenir que des lettres, espaces ou tirets."
            )
    email = values["email"]
    if not email:
        errors["email"] = "Merci d'indiquer votre adresse email."
    elif len(email) > 254:
        errors["email"] = "L'adresse email ne doit pas dépasser 254 caractères."
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors["email"] = "Merci d'indiquer une adresse email valide."
    studies = values["studies"]
    if not studies:
        errors["studies"] = "Merci d'indiquer vos études."
    elif not 2 <= len(studies) <= 200:
        errors["studies"] = "Le champ études doit contenir entre 2 et 200 caractères."
    if len(values["motivation"]) > 2000:
        errors["motivation"] = "Votre message ne doit pas dépasser 2000 caractères."
    if not consent:
        errors["consent"] = (
            "Merci de cocher la case de consentement pour envoyer votre candidature."
        )
    return errors


def rejoindre(request):
    """Formulaire de candidature (GET) et traitement (POST).

    POST : honeypot « website » (rempli => succès silencieux sans stockage),
    validation serveur, rate limiting (3/h par IP et 30/h global), création
    de l'Application puis notification email au bureau (jamais bloquante).
    """
    context = {"sent": None, "errors": {}, "values": {}, "rate_limited": False}
    if request.method == "POST":
        values = {
            field: request.POST.get(field, "").strip()
            for field in ("last_name", "first_name", "email", "studies", "motivation")
        }
        consent = request.POST.get("consent") == "on"

        # Honeypot anti-bot : un humain ne voit jamais ce champ. On fait
        # semblant de réussir, sans rien stocker ni notifier.
        if request.POST.get("website", ""):
            context["sent"] = {
                "first_name": values["first_name"],
                "email": values["email"],
            }
            return render(request, "website/rejoindre.html", context)

        errors = _validate_candidature(values, consent)
        if errors:
            context.update({"errors": errors, "values": values, "consent": consent})
            return render(request, "website/rejoindre.html", context)

        ip = client_ip(request)
        allowed = consume(f"apply:{ip}", 3, 3600) and consume("apply:global", 30, 3600)
        if not allowed:
            context.update(
                {"rate_limited": True, "values": values, "consent": consent}
            )
            return render(request, "website/rejoindre.html", context)

        Application.objects.create(
            first_name=values["first_name"],
            last_name=values["last_name"],
            email=values["email"],
            studies=values["studies"],
            motivation=values["motivation"],
            status=Application.Status.NOUVEAU,
        )
        # Notification au bureau — fail_silently : l'envoi ne doit jamais
        # bloquer la candidature.
        body = (
            "Nouvelle candidature reçue via le formulaire « Rejoindre ».\n\n"
            f"Nom : {values['last_name']}\n"
            f"Prénom : {values['first_name']}\n"
            f"Email : {values['email']}\n"
            f"Études : {values['studies']}\n\n"
            "Motivation :\n"
            f"{values['motivation'] or '(non renseignée)'}\n"
        )
        send_mail(
            "Nouvelle candidature — Quantum Dynamics",
            body,
            settings.DEFAULT_FROM_EMAIL,
            [settings.NOTIFY_EMAIL],
            fail_silently=True,
        )
        context["sent"] = {
            "first_name": values["first_name"],
            "email": values["email"],
        }
    return render(request, "website/rejoindre.html", context)


def politique_confidentialite(request):
    return render(request, "website/politique_confidentialite.html")


def cgu(request):
    return render(request, "website/cgu.html")
