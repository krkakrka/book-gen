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
# Railway's healthcheck probe sends Host: healthcheck.railway.app (confirmed
# via Railway's own deploy diagnostics — 127.0.0.1/localhost were a guess
# based on a loopback test and didn't match the probe's actual Host header,
# so the healthcheck kept getting rejected as DisallowedHost). Not reachable
# from the public internet, so allowing it isn't a security downgrade.
ALLOWED_HOSTS += ["healthcheck.railway.app", "127.0.0.1", "localhost"]
_railway_private_domain = os.environ.get("RAILWAY_PRIVATE_DOMAIN")
if _railway_private_domain:
    ALLOWED_HOSTS.append(_railway_private_domain)

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
# Railway's internal healthcheck probe connects over plain HTTP directly to
# the container (it doesn't go through the edge proxy that sets the header
# above), so without this exemption the redirect below would 301 it instead
# of returning 200, and the deploy would never pass healthcheck.
SECURE_REDIRECT_EXEMPT = [r"^api/health/$"]
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30  # 30 days
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Never seed the known-password dev login outside dev/test.
SEED_DEV_USER = False

# Django's default logging config only reports 500s via email to ADMINS
# (unconfigured here) when DEBUG=False — exceptions otherwise vanish rather
# than reaching stdout/Railway's logs. Route them to the console instead.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {
        "django": {"handlers": ["console"], "level": "INFO"},
        "django.request": {"handlers": ["console"], "level": "ERROR", "propagate": False},
    },
}
