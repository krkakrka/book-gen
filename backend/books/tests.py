# Requires a local Postgres instance reachable via the POSTGRES_* env vars
# (see .env.example) — Django creates/drops a throwaway test database against
# that same server, per project convention of not mocking the DB.
from django.db import IntegrityError, transaction
from django.db.models import ProtectedError
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

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


class BookListCreateAPITests(APITestCase):
    def setUp(self):
        self.value = Value.objects.get(pk="courage")
        self.style = Style.objects.get(pk="crayon")

    def _make_book(self, title="Pip and the Whispering Forest"):
        book = Book.objects.create(value=self.value, style=self.style, title=title, story_id="forest")
        Section.objects.create(book=book, order=0, image_desc="a forest", text="Pip walked in.")
        Section.objects.create(book=book, order=1, image_desc="a clearing", text="Pip found a clearing.")
        return book

    def test_list_empty(self):
        response = self.client.get("/api/books/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_list_returns_seeded_books_with_derived_fields_and_ordered_sections(self):
        book = self._make_book()
        Book.objects.create(value=self.value, style=self.style, title="Second Book", story_id="forest")

        response = self.client.get("/api/books/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        payload = next(b for b in response.data if b["id"] == str(book.id))
        self.assertEqual(payload["valueId"], "courage")
        self.assertEqual(payload["value"], "Courage")
        self.assertEqual(payload["accent"], "#2E6BFF")
        self.assertEqual(payload["styleId"], "crayon")
        self.assertEqual(payload["storyId"], "forest")
        self.assertEqual(
            [s["text"] for s in payload["sections"]],
            ["Pip walked in.", "Pip found a clearing."],
        )

    def test_create_valid_book_persists_and_echoes_generated_id(self):
        payload = {
            "valueId": "courage",
            "title": "Pip and the Whispering Forest",
            "storyId": "forest",
            "styleId": "crayon",
            "sections": [
                {"imageDesc": "a forest", "text": "Pip walked in."},
                {"imageDesc": "a clearing", "text": "Pip found a clearing."},
            ],
        }
        response = self.client.post("/api/books/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["id"])
        book = Book.objects.get(pk=response.data["id"])
        self.assertEqual(book.title, "Pip and the Whispering Forest")
        self.assertEqual(list(book.sections.values_list("text", flat=True)), ["Pip walked in.", "Pip found a clearing."])

    def test_create_with_empty_sections_returns_400(self):
        payload = {
            "valueId": "courage",
            "title": "No Pages",
            "storyId": "forest",
            "styleId": "crayon",
            "sections": [],
        }
        response = self.client.post("/api/books/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("sections", response.data)

    def test_create_with_unknown_value_or_style_returns_400(self):
        payload = {
            "valueId": "not-a-real-value",
            "title": "Bad Value",
            "storyId": "forest",
            "styleId": "crayon",
            "sections": [{"imageDesc": "a forest", "text": "Pip walked in."}],
        }
        response = self.client.post("/api/books/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("valueId", response.data)

        payload["valueId"] = "courage"
        payload["styleId"] = "not-a-real-style"
        response = self.client.post("/api/books/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("styleId", response.data)

    def test_create_with_missing_title_returns_400(self):
        payload = {
            "valueId": "courage",
            "storyId": "forest",
            "styleId": "crayon",
            "sections": [{"imageDesc": "a forest", "text": "Pip walked in."}],
        }
        response = self.client.post("/api/books/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)


class BookRetrieveAPITests(APITestCase):
    def setUp(self):
        self.value = Value.objects.get(pk="courage")
        self.style = Style.objects.get(pk="crayon")
        self.book = Book.objects.create(value=self.value, style=self.style, title="Pip", story_id="forest")
        Section.objects.create(book=self.book, order=0, image_desc="a forest", text="Pip walked in.")

    def test_retrieve_existing_book_returns_full_shape(self):
        response = self.client.get(f"/api/books/{self.book.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(self.book.id))
        self.assertEqual(response.data["title"], "Pip")
        self.assertEqual(len(response.data["sections"]), 1)
        self.assertEqual(response.data["sections"][0]["text"], "Pip walked in.")

    def test_retrieve_unknown_id_returns_404(self):
        response = self.client.get("/api/books/00000000-0000-0000-0000-000000000000/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class BookUpdateAPITests(APITestCase):
    def setUp(self):
        self.value = Value.objects.get(pk="courage")
        self.style = Style.objects.get(pk="crayon")
        self.other_style = Style.objects.get(pk="watercolor")
        self.book = Book.objects.create(value=self.value, style=self.style, title="Pip", story_id="forest")
        Section.objects.create(book=self.book, order=0, image_desc="a forest", text="Pip walked in.")

    def test_partial_update_without_sections_leaves_sections_unchanged(self):
        response = self.client.patch(
            f"/api/books/{self.book.id}/",
            {"title": "Pip, Revised", "styleId": "watercolor"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.book.refresh_from_db()
        self.assertEqual(self.book.title, "Pip, Revised")
        self.assertEqual(self.book.style_id, "watercolor")
        self.assertEqual(self.book.sections.count(), 1)
        self.assertEqual(self.book.sections.first().text, "Pip walked in.")

    def test_full_update_replaces_sections_in_new_order(self):
        payload = {
            "valueId": "courage",
            "title": "Pip",
            "storyId": "forest",
            "styleId": "crayon",
            "sections": [
                {"imageDesc": "new first", "text": "New first page."},
                {"imageDesc": "new second", "text": "New second page."},
            ],
        }
        response = self.client.put(f"/api/books/{self.book.id}/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.book.refresh_from_db()
        self.assertEqual(
            list(self.book.sections.order_by("order").values_list("text", flat=True)),
            ["New first page.", "New second page."],
        )


class BookDeleteAPITests(APITestCase):
    def setUp(self):
        self.value = Value.objects.get(pk="courage")
        self.style = Style.objects.get(pk="crayon")
        self.book = Book.objects.create(value=self.value, style=self.style, title="Pip", story_id="forest")
        Section.objects.create(book=self.book, order=0, image_desc="a forest", text="Pip walked in.")

    def test_delete_existing_book_cascades_sections(self):
        book_id = self.book.id
        response = self.client.delete(f"/api/books/{book_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Book.objects.filter(pk=book_id).exists())
        self.assertEqual(Section.objects.filter(book_id=book_id).count(), 0)

    def test_delete_unknown_id_returns_404(self):
        response = self.client.delete("/api/books/00000000-0000-0000-0000-000000000000/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
