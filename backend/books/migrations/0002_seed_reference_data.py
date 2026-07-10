from django.core.management import call_command
from django.db import migrations


def load_fixtures(apps, schema_editor):
    call_command("loaddata", "values.json", "styles.json")


def unload_fixtures(apps, schema_editor):
    Value = apps.get_model("books", "Value")
    Style = apps.get_model("books", "Style")
    Value.objects.all().delete()
    Style.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("books", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(load_fixtures, unload_fixtures),
    ]
