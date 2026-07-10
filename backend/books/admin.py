from django.contrib import admin

from .models import Book, Section, Style, Value


class ReadOnlyReferenceAdmin(admin.ModelAdmin):
    """Rows come from the fixture migration only — no add/change/delete via admin."""

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Value)
class ValueAdmin(ReadOnlyReferenceAdmin):
    list_display = ("id", "name", "color", "short", "desc")


@admin.register(Style)
class StyleAdmin(ReadOnlyReferenceAdmin):
    list_display = ("id", "name", "desc")


class SectionInline(admin.TabularInline):
    model = Section
    ordering = ("order",)
    extra = 0


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("title", "value", "style", "created_at")
    inlines = [SectionInline]
