import uuid

from django.db import models


class Value(models.Model):
    """Reference data mirroring lib/types.ts's ValueDef. Fixed rows, seeded via migration."""

    id = models.CharField(primary_key=True, max_length=30)
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7)
    short = models.CharField(max_length=100)
    desc = models.TextField()

    def __str__(self):
        return self.name


class Style(models.Model):
    """Reference data mirroring lib/types.ts's StyleDef. Fixed rows, seeded via migration."""

    id = models.CharField(primary_key=True, max_length=20)
    name = models.CharField(max_length=50)
    desc = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Book(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    value = models.ForeignKey(Value, on_delete=models.PROTECT, related_name="books")
    title = models.CharField(max_length=255)
    story_id = models.CharField(max_length=50)
    style = models.ForeignKey(Style, on_delete=models.PROTECT, related_name="books")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.value_id})"


class Section(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="sections")
    order = models.PositiveIntegerField()
    image_desc = models.TextField()
    text = models.TextField()

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(fields=["book", "order"], name="unique_section_order_per_book"),
        ]

    def __str__(self):
        return f"{self.book.title} — page {self.order}"
