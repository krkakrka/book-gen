from django.core.management.base import BaseCommand

from books.models import Book, Section, Style, Value
from books.seed_data import SEED_BOOKS


class Command(BaseCommand):
    """Reset Book/Section rows to exactly the 3 seed books.

    Used before e2e runs so the shared dev database starts from a known,
    repeatable baseline (unlike the old localStorage-per-context world,
    Postgres persists across test runs and across create/edit/delete tests).
    """

    help = "Delete all books and recreate the 3 seed books from books/seed_data.py."

    def handle(self, *args, **options):
        Book.objects.all().delete()
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
        self.stdout.write(self.style.SUCCESS(f"Reset to {len(SEED_BOOKS)} seed books."))
