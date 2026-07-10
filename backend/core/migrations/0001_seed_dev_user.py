import os

from django.contrib.auth import get_user_model
from django.db import migrations


def seed_dev_user(apps, schema_editor):
    email = os.environ.get("DJANGO_DEV_USER_EMAIL", "parent@home.com")
    password = os.environ.get("DJANGO_DEV_USER_PASSWORD", "storyseed-dev")
    user, _ = get_user_model().objects.get_or_create(
        username=email, defaults={"email": email}
    )
    user.set_password(password)
    user.save()


def unseed_dev_user(apps, schema_editor):
    email = os.environ.get("DJANGO_DEV_USER_EMAIL", "parent@home.com")
    get_user_model().objects.filter(username=email).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.RunPython(seed_dev_user, unseed_dev_user),
    ]
