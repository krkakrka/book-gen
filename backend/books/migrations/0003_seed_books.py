from django.db import migrations

from books.seed_data import SEED_BOOKS

SEED_TITLES = [b["title"] for b in SEED_BOOKS]


def seed_books(apps, schema_editor):
    Book = apps.get_model("books", "Book")
    Section = apps.get_model("books", "Section")
    Value = apps.get_model("books", "Value")
    Style = apps.get_model("books", "Style")

    for spec in SEED_BOOKS:
        book = Book.objects.create(
            value=Value.objects.get(pk=spec["value_id"]),
            style=Style.objects.get(pk=spec["style_id"]),
            title=spec["title"],
            story_id=spec["story_id"],
        )
        Section.objects.bulk_create(
            [
                Section(book=book, order=i, image_desc=s["image_desc"], text=s["text"])
                for i, s in enumerate(spec["sections"])
            ]
        )


def unseed_books(apps, schema_editor):
    Book = apps.get_model("books", "Book")
    Book.objects.filter(title__in=SEED_TITLES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("books", "0002_seed_reference_data"),
    ]

    operations = [
        migrations.RunPython(seed_books, unseed_books),
    ]
