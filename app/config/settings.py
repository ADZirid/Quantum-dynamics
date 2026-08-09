"""Configuration Django — Quantum Dynamics (migration React/tRPC → Django 5).

Sécurité native imposée par le client : DEBUG off par défaut, SECRET_KEY via
environnement (sinon générée au boot et persistée localement avec warning),
cookies sécurisés hors debug, CSP stricte, WhiteNoise pour les statiques.
"""
import logging
import os
import secrets
from pathlib import Path

import dj_database_url

logger = logging.getLogger("config")

BASE_DIR = Path(__file__).resolve().parent.parent


def _env_bool(name: str, default: bool = False) -> bool:
    return os.environ.get(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


DEBUG = _env_bool("DEBUG", False)


def _load_secret_key() -> str:
    """SECRET_KEY : env prioritaire, sinon générée au boot et persistée."""
    key = os.environ.get("SECRET_KEY", "").strip()
    if key:
        return key
    key_file = BASE_DIR / ".secret_key"
    if key_file.exists():
        return key_file.read_text().strip()
    key = secrets.token_urlsafe(64)
    try:
        key_file.write_text(key)
        key_file.chmod(0o600)
    except OSError:
        pass
    logger.warning(
        "SECRET_KEY absente de l'environnement : une clé a été générée et "
        "persistée dans %s. Définissez SECRET_KEY en production.",
        key_file,
    )
    return key


SECRET_KEY = _load_secret_key()

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("ALLOWED_HOSTS", "*").split(",")
    if h.strip()
]

INSTALLED_APPS = [
    # django.contrib.admin volontairement absent : dashboard custom sur /admin/.
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "core",
    "website",
    "library",
    "projects",
    "accounts_app",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "core.middleware.ContentSecurityPolicyMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Base de données : DATABASE_URL (MySQL via pymysql) sinon SQLite locale.
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Europe/Paris"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
    },
}

# --- Stockage des fichiers (FileField : disque local en dev, S3/R2 en prod) --
MEDIA_ROOT = BASE_DIR / "media"
MEDIA_URL = "/media/"

if os.environ.get("FILE_STORAGE", "local") == "s3":
    # Object storage compatible S3 (ex. Cloudflare R2, Backblaze B2).
    STORAGES["default"] = {"BACKEND": "storages.backends.s3boto3.S3Boto3Storage"}
    AWS_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY", "")
    AWS_STORAGE_BUCKET_NAME = os.environ.get("R2_BUCKET", "")
    AWS_S3_ENDPOINT_URL = os.environ.get("R2_ENDPOINT", "")
    AWS_S3_REGION_NAME = os.environ.get("R2_REGION", "auto")
    AWS_S3_SIGNATURE_VERSION = "s3v4"
    AWS_S3_ADDRESSING_STYLE = "path"
    # Les fichiers sont servis via les vues Django (serve_file/download_file) :
    # le bucket reste privé.
    AWS_QUERYSTRING_AUTH = False

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- Sécurité (exigences client) -------------------------------------------
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False  # le token doit rester lisible pour les formulaires JS
X_FRAME_OPTIONS = "SAMEORIGIN"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

# Politique CSP appliquée par core.middleware.ContentSecurityPolicyMiddleware
# (identique à l'ancienne version React).
CSP_POLICY = (
    "default-src 'self'; "
    "img-src 'self' data:; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "frame-ancestors 'self'; "
    "object-src 'self'; "
    "base-uri 'self'; "
    "form-action 'self'"
)

# --- Email -------------------------------------------------------------------
# Console par défaut ; SMTP Gmail si EMAIL_HOST / EMAIL_HOST_USER /
# EMAIL_HOST_PASSWORD sont fournis.
if os.environ.get("EMAIL_HOST"):
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = os.environ["EMAIL_HOST"]
    EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
    EMAIL_USE_TLS = _env_bool("EMAIL_USE_TLS", True)
    EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
    # Timeout borné : un SMTP injoignable doit lever (et être rattrapé par
    # fail_silently) plutôt que faire bloquer la requête de candidature.
    EMAIL_TIMEOUT = int(os.environ.get("EMAIL_TIMEOUT", "8"))
    # Préférence IPv4 : smtp.gmail.com résout aussi en IPv6 et Render (hébergé
    # sur un plan sans route IPv6) renvoie « Network is unreachable » (errno 101).
    # On trie getaddrinfo pour essayer les adresses IPv4 en premier.
    import socket as _socket

    _orig_getaddrinfo = _socket.getaddrinfo

    def _prefer_ipv4(host, port, *args, **kwargs):
        results = _orig_getaddrinfo(host, port, *args, **kwargs)
        return sorted(results, key=lambda s: 0 if s[0] == _socket.AF_INET else 1)

    _socket.getaddrinfo = _prefer_ipv4
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

DEFAULT_FROM_EMAIL = os.environ.get(
    "DEFAULT_FROM_EMAIL", "quantumdynamics.asso@gmail.com"
)
NOTIFY_EMAIL = os.environ.get("NOTIFY_EMAIL", "quantumdynamics.asso@gmail.com")

LOGIN_URL = "/espace-membres/"
LOGIN_REDIRECT_URL = "/admin/"
LOGOUT_REDIRECT_URL = "/"

# --- RGPD ----------------------------------------------------------------------
# Durée de conservation des candidatures (12 mois, cf. politique de confidentialité).
APPLICATION_RETENTION_DAYS = int(os.environ.get("APPLICATION_RETENTION_DAYS", "365"))
# Durée de conservation des compteurs de rate-limiting (IP adresses).
RATELIMIT_RETENTION_DAYS = int(os.environ.get("RATELIMIT_RETENTION_DAYS", "30"))

# Sessions courtes : le cookie expire à la fermeture du navigateur, sinon après
# 24 h d'inactivité (aligné sur la politique : « durée de la session uniquement »).
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_AGE = 60 * 60 * 24  # 24 h
