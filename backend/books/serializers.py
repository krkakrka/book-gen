from django.db import transaction
from rest_framework import serializers

from .models import Book, Section, Style, Value


class SectionSerializer(serializers.ModelSerializer):
    imageDesc = serializers.CharField(source="image_desc")

    class Meta:
        model = Section
        fields = ["imageDesc", "text"]


class BookSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    valueId = serializers.PrimaryKeyRelatedField(source="value", queryset=Value.objects.all())
    value = serializers.CharField(source="value.name", read_only=True)
    accent = serializers.CharField(source="value.color", read_only=True)
    storyId = serializers.CharField(source="story_id")
    styleId = serializers.PrimaryKeyRelatedField(source="style", queryset=Style.objects.all())
    sections = SectionSerializer(many=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Book
        fields = [
            "id",
            "valueId",
            "value",
            "accent",
            "title",
            "storyId",
            "styleId",
            "sections",
            "createdAt",
            "updatedAt",
        ]

    def validate_sections(self, value):
        if not value:
            raise serializers.ValidationError("A book must have at least one section.")
        return value

    def create(self, validated_data):
        sections_data = validated_data.pop("sections")
        book = Book.objects.create(**validated_data)
        Section.objects.bulk_create(
            [Section(book=book, order=i, **s) for i, s in enumerate(sections_data)]
        )
        return book

    def update(self, instance, validated_data):
        sections_data = validated_data.pop("sections", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if sections_data is not None:
            with transaction.atomic():
                instance.sections.all().delete()
                Section.objects.bulk_create(
                    [Section(book=instance, order=i, **s) for i, s in enumerate(sections_data)]
                )
        return instance
