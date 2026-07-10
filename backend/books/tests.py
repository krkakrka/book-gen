# Requires a local Postgres instance reachable via the POSTGRES_* env vars
# (see .env.example) — Django creates/drops a throwaway test database against
# that same server, per project convention of not mocking the DB.
from django.db import IntegrityError, transaction
from django.db.models import ProtectedError
from django.test import TestCase

from .models import Book, Section, Style, Value


class ReferenceDataSeedTests(TestCase):
    """0002_seed_reference_data loads fixtures transcribed verbatim from lib/data.ts."""

    def test_values_seeded(self):
        self.assertEqual(Value.objects.count(), 9)
        courage = Value.objects.get(pk="courage")
        self.assertEqual(courage.name, "Courage")
        self.assertEqual(courage.color, "#2E6BFF")
        self.assertEqual(courage.short, "being brave")
        self.assertEqual(
            courage.desc, "Someone who tries even when they feel scared or unsure."
        )

    def test_styles_seeded(self):
        self.assertEqual(Style.objects.count(), 3)
        watercolor = Style.objects.get(pk="watercolor")
        self.assertEqual(watercolor.name, "Soft Watercolor")
        self.assertEqual(watercolor.desc, "dreamy washes of color")


class BookModelTests(TestCase):
    def setUp(self):
        self.value = Value.objects.get(pk="courage")
        self.style = Style.objects.get(pk="crayon")

    def test_create_book_via_value_and_style_fk(self):
        book = Book.objects.create(
            value=self.value, style=self.style, title="Pip and the Whispering Forest", story_id="forest"
        )
        self.assertEqual(book.value, self.value)
        self.assertEqual(book.style, self.style)

    def test_str(self):
        book = Book.objects.create(
            value=self.value, style=self.style, title="Pip and the Whispering Forest", story_id="forest"
        )
        self.assertEqual(str(book), "Pip and the Whispering Forest (courage)")


class SectionModelTests(TestCase):
    def setUp(self):
        value = Value.objects.get(pk="courage")
        style = Style.objects.get(pk="crayon")
        self.book = Book.objects.create(value=value, style=style, title="Pip", story_id="forest")

    def test_sections_ordered_by_order(self):
        Section.objects.create(book=self.book, order=2, image_desc="third", text="third")
        Section.objects.create(book=self.book, order=0, image_desc="first", text="first")
        Section.objects.create(book=self.book, order=1, image_desc="second", text="second")

        ordered = list(self.book.sections.all())
        self.assertEqual([s.order for s in ordered], [0, 1, 2])
        self.assertEqual([s.text for s in ordered], ["first", "second", "third"])

    def test_duplicate_order_within_book_raises_integrity_error(self):
        Section.objects.create(book=self.book, order=0, image_desc="a", text="a")
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Section.objects.create(book=self.book, order=0, image_desc="b", text="b")


class CascadeAndProtectTests(TestCase):
    def setUp(self):
        self.value = Value.objects.get(pk="courage")
        self.style = Style.objects.get(pk="crayon")
        self.book = Book.objects.create(value=self.value, style=self.style, title="Pip", story_id="forest")
        Section.objects.create(book=self.book, order=0, image_desc="a", text="a")

    def test_deleting_book_cascades_to_sections(self):
        book_id = self.book.id
        self.book.delete()
        self.assertEqual(Section.objects.filter(book_id=book_id).count(), 0)

    def test_deleting_referenced_value_is_protected(self):
        with self.assertRaises(ProtectedError):
            self.value.delete()

    def test_deleting_referenced_style_is_protected(self):
        with self.assertRaises(ProtectedError):
            self.style.delete()
