"""Filtres de template : formats français (dates longues, tailles de fichiers).

Noms de mois codés en dur : le rendu français ne dépend pas des locales
système du conteneur (souvent absentes des images slim).
"""
import datetime

from django import template

register = template.Library()

_MOIS = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
]


@register.filter
def date_fr(value) -> str:
    """« 12 mars 2025 » — accepte date ou datetime, chaîne vide sinon."""
    if isinstance(value, datetime.datetime):
        value = value.date()
    if not isinstance(value, datetime.date):
        return ""
    return f"{value.day} {_MOIS[value.month - 1]} {value.year}"


@register.filter
def taille_fichier(value) -> str:
    """Taille lisible en français : « 512 o », « 248 Ko », « 1,4 Mo ».

    Séparateur décimal = virgule, conformément à l'usage français.
    """
    try:
        octets = int(value)
    except (TypeError, ValueError):
        return ""
    if octets < 0:
        return ""
    if octets < 1024:
        return f"{octets} o"
    if octets < 1024 * 1024:
        ko = octets / 1024
        if ko >= 100 or float(ko).is_integer():
            return f"{ko:.0f} Ko"
        return f"{ko:.1f} Ko".replace(".", ",")
    mo = octets / (1024 * 1024)
    if mo >= 100 or float(mo).is_integer():
        return f"{mo:.0f} Mo"
    return f"{mo:.1f} Mo".replace(".", ",")
