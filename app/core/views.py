"""Vues du noyau : streaming sécurisé des fichiers stockés en base.

Contrat gelé pour les agents suivants :
- serve_file(request, kind, pk)   -> lecture inline du PDF (lecteur)
- download_file(request, kind, pk) -> téléchargement (Content-Disposition: attachment)
avec kind ∈ {"document", "newsletter"}.
"""
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404

from core.models import Document, Newsletter

_MODELS = {
    "document": Document,
    "newsletter": Newsletter,
}


def _get_file_obj(kind: str, pk: int):
    model = _MODELS.get(kind)
    if model is None:
        raise Http404("Type de fichier inconnu.")
    obj = get_object_or_404(model, pk=pk)
    if not obj.file_data:
        raise Http404("Fichier absent.")
    return obj


def _pdf_response(obj, attachment: bool) -> FileResponse:
    import io

    response = FileResponse(
        io.BytesIO(bytes(obj.file_data)), content_type="application/pdf"
    )
    disposition = "attachment" if attachment else "inline"
    response["Content-Disposition"] = f'{disposition}; filename="{obj.file_name}"'
    if obj.file_size:
        response["Content-Length"] = str(obj.file_size)
    response["X-Content-Type-Options"] = "nosniff"
    return response


def serve_file(request, kind: str, pk: int):
    """Sert le PDF en lecture inline (utilisé par le lecteur du site)."""
    return _pdf_response(_get_file_obj(kind, pk), attachment=False)


def download_file(request, kind: str, pk: int):
    """Force le téléchargement du PDF."""
    return _pdf_response(_get_file_obj(kind, pk), attachment=True)
