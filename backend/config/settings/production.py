"""Production settings.

Fails loudly at import time if required environment variables are missing,
rather than silently falling back to dev-only defaults.
"""
import os

from .base import *  # noqa: F401,F403


def _require_env(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(
            f"{name} must be set in the environment when running with "
            "config.settings.production"
        )
    return value


DEBUG = False

SECRET_KEY = _require_env("DJANGO_SECRET_KEY")

ALLOWED_HOSTS = [
    host.strip()
    for host in _require_env("DJANGO_ALLOWED_HOSTS").split(",")
    if host.strip()
]

# Unlike base.py, these have no localhost fallback here — a real deploy must
# set them explicitly.
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in _require_env("CORS_ALLOWED_ORIGINS").split(",")
    if origin.strip()
]

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in _require_env("CSRF_TRUSTED_ORIGINS").split(",")
    if origin.strip()
]

# Cookies must only travel over HTTPS in production.
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# The frontend (Vercel) and backend (Railway) live on different domains, so
# this is a cross-site request as far as cookies are concerned — base.py's
# SameSite=Lax default would silently drop the session/CSRF cookies on every
# credentialed fetch. SameSite=None requires Secure=True (set above).
SESSION_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SAMESITE = "None"

# Assumes TLS is terminated at a reverse proxy/load balancer in front of Django.
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30  # 30 days
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Never seed the known-password dev login outside dev/test.
SEED_DEV_USER = False
