"""Preuve de consentement RGPD (art. 7) sur les candidatures."""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="consent_at",
            field=models.DateTimeField(
                blank=True, null=True, verbose_name="consentement donné le"
            ),
        ),
        migrations.AddField(
            model_name="application",
            name="consent_ip",
            field=models.GenericIPAddressField(
                blank=True, null=True, verbose_name="IP au moment du consentement"
            ),
        ),
    ]
