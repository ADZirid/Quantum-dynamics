"""Stockage des PDF via FileField (sortie des BLOB de la base).

Migration en trois temps :
1. Ajout du champ `file` (nullable pendant la migration).
2. Export des BLOB existants (file_data) vers le stockage configuré
   (disque local en dev, S3-compatible en prod) et remplissage de `file`.
3. Suppression de file_name/file_data et passage de `file` en non-nullable.
"""

import core.models
import django.core.files.storage
from django.db import migrations, models
import uuid


def _export_blobs(apps, schema_editor):
    """Écrit chaque BLOB sur le stockage par défaut et remplit le FileField."""
    from django.core.files.base import ContentFile
    from django.core.files.storage import default_storage

    Document = apps.get_model("core", "Document")
    Newsletter = apps.get_model("core", "Newsletter")
    for model in (Document, Newsletter):
        for obj in model.objects.all():
            if obj.file_data and not obj.file:
                name = f"pdf/{uuid.uuid4().hex}.pdf"
                default_storage.save(name, ContentFile(bytes(obj.file_data)))
                obj.file = name
                obj.save(update_fields=["file"])


def _reverse_blobs(apps, schema_editor):
    """Rien à restaurer : les BLOB sont irrécupérables après suppression."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_application_consentement"),
    ]

    operations = [
        migrations.AddField(
            model_name="document",
            name="file",
            field=models.FileField(
                blank=True,
                null=True,
                upload_to=core.models._pdf_upload_to,
                verbose_name="fichier",
            ),
        ),
        migrations.AddField(
            model_name="newsletter",
            name="file",
            field=models.FileField(
                blank=True,
                null=True,
                upload_to=core.models._pdf_upload_to,
                verbose_name="fichier",
            ),
        ),
        migrations.RunPython(_export_blobs, _reverse_blobs),
        migrations.RemoveField(model_name="document", name="file_data"),
        migrations.RemoveField(model_name="document", name="file_name"),
        migrations.RemoveField(model_name="newsletter", name="file_data"),
        migrations.RemoveField(model_name="newsletter", name="file_name"),
        migrations.AlterField(
            model_name="document",
            name="file",
            field=models.FileField(
                upload_to=core.models._pdf_upload_to, verbose_name="fichier"
            ),
        ),
        migrations.AlterField(
            model_name="newsletter",
            name="file",
            field=models.FileField(
                upload_to=core.models._pdf_upload_to, verbose_name="fichier"
            ),
        ),
    ]
